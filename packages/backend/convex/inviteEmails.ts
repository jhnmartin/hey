import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendInviteEmail = internalAction({
  args: {
    email: v.string(),
    orgName: v.string(),
    role: v.string(),
    inviterName: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return; // skip silently in dev without Resend

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const signupUrl = `${appUrl}/signup?role=organizer`;
    const loginUrl = `${appUrl}/login`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hey Thursday <noreply@updates.heythursday.app>",
        to: [args.email],
        subject: `You've been invited to join ${args.orgName} on Hey Thursday`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <h2 style="margin-bottom: 8px;">You're invited!</h2>
            <p>${args.inviterName} invited you to join <strong>${args.orgName}</strong> as ${args.role === "admin" ? "an admin" : "a member"}.</p>
            <a href="${signupUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Accept Invite</a>
            <p style="margin-top: 24px; font-size: 14px; color: #666;">Already have an account? <a href="${loginUrl}">Log in</a></p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error ${res.status}: ${body}`);
    }
  },
});
