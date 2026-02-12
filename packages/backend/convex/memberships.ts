import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByProfile = query({
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

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    const results = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        if (!org) return null;
        let avatarUrl = org.avatarUrl ?? null;
        if (org.avatarStorageId) {
          const url = await ctx.storage.getUrl(org.avatarStorageId);
          if (url) avatarUrl = url;
        }
        return { membership: m, org: { ...org, avatarUrl } };
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

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    const results = await Promise.all(
      memberships.map(async (m) => {
        const profile = await ctx.db.get(m.profileId);
        if (!profile) return null;
        let avatarUrl = profile.avatarUrl ?? null;
        if (profile.avatarStorageId) {
          const url = await ctx.storage.getUrl(profile.avatarStorageId);
          if (url) avatarUrl = url;
        }
        return { membership: m, profile: { ...profile, avatarUrl } };
      }),
    );

    return results.filter((r) => r !== null);
  },
});
