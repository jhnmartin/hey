import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const send = mutation({
  args: {
    orgId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) throw new Error("Profile not found");

    // Verify caller is owner or admin of the org
    const callerMembership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", args.orgId),
      )
      .unique();
    if (!callerMembership || callerMembership.role === "member") {
      throw new Error("Only owners and admins can send invites");
    }

    const email = args.email.toLowerCase();

    // Check if already a member
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existingProfile) {
      const existingMembership = await ctx.db
        .query("memberships")
        .withIndex("by_profile_org", (q) =>
          q.eq("profileId", existingProfile._id).eq("orgId", args.orgId),
        )
        .unique();
      if (existingMembership) {
        throw new Error("This person is already a member of this organization");
      }
    }

    // Check for duplicate pending invite
    const pendingInvites = await ctx.db
      .query("invites")
      .withIndex("by_email_status", (q) =>
        q.eq("email", email).eq("status", "pending"),
      )
      .collect();
    const duplicate = pendingInvites.find((i) => i.orgId === args.orgId);
    if (duplicate) {
      throw new Error("A pending invite already exists for this email");
    }

    const inviteId = await ctx.db.insert("invites", {
      orgId: args.orgId,
      email,
      role: args.role,
      invitedBy: profile._id,
      status: "pending",
    });

    // Schedule invite email
    const org = await ctx.db.get(args.orgId);
    await ctx.scheduler.runAfter(
      0,
      internal.inviteEmails.sendInviteEmail,
      {
        email,
        orgName: org?.name ?? "an organization",
        role: args.role,
        inviterName: profile.name ?? "A team member",
      },
    );

    return inviteId;
  },
});

export const listPendingForEmail = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) return [];

    const invites = await ctx.db
      .query("invites")
      .withIndex("by_email_status", (q) =>
        q.eq("email", profile.email.toLowerCase()).eq("status", "pending"),
      )
      .collect();

    const results = await Promise.all(
      invites.map(async (invite) => {
        const org = await ctx.db.get(invite.orgId);
        return org ? { invite, org } : null;
      }),
    );

    return results.filter((r) => r !== null);
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("invites")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const accept = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) throw new Error("Profile not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.status !== "pending") {
      throw new Error("Invite not found or already resolved");
    }
    if (invite.email !== profile.email.toLowerCase()) {
      throw new Error("This invite is not for you");
    }

    // Check not already a member
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", invite.orgId),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("memberships", {
        profileId: profile._id,
        orgId: invite.orgId,
        role: invite.role,
      });
    }

    await ctx.db.patch(args.inviteId, { status: "accepted" });
  },
});

export const decline = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) throw new Error("Profile not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.status !== "pending") {
      throw new Error("Invite not found or already resolved");
    }
    if (invite.email !== profile.email.toLowerCase()) {
      throw new Error("This invite is not for you");
    }

    await ctx.db.patch(args.inviteId, { status: "declined" });
  },
});

export const revoke = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!profile) throw new Error("Profile not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.status !== "pending") {
      throw new Error("Invite not found or already pending");
    }

    // Verify caller is owner or admin
    const callerMembership = await ctx.db
      .query("memberships")
      .withIndex("by_profile_org", (q) =>
        q.eq("profileId", profile._id).eq("orgId", invite.orgId),
      )
      .unique();
    if (!callerMembership || callerMembership.role === "member") {
      throw new Error("Only owners and admins can revoke invites");
    }

    await ctx.db.delete(args.inviteId);
  },
});
