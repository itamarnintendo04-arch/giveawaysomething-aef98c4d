import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { cookie, createSession, getCookieFrom, SESSION_COOKIE, STATE_COOKIE } = await import("@/lib/session.server");
        const { saveDiscordConnection } = await import("@/lib/discord.server");
        const url = new URL(request.url);
        const fail = (reason: string) =>
          new Response(null, { status: 302, headers: { Location: `/?error=${reason}` } });

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state || state !== getCookieFrom(request, STATE_COOKIE)) return fail("invalid_state");

        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env["DISCORD_CLIENT_ID"] ?? "",
            client_secret: process.env["DISCORD_CLIENT_SECRET"] ?? "",
            grant_type: "authorization_code",
            code,
            redirect_uri: `${url.origin}/api/public/auth/callback`,
          }),
        });
        if (!tokenRes.ok) return fail("token");
        const tokens = (await tokenRes.json()) as { access_token: string; refresh_token: string; expires_in: number };
        if (!tokens.access_token || !tokens.refresh_token || !Number.isFinite(tokens.expires_in)) return fail("token");

        const meRes = await fetch("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (!meRes.ok) return fail("profile");
        const me = (await meRes.json()) as import("@/lib/session.server").DiscordUser;
        if (!/^\d{17,20}$/.test(me.id) || typeof me.username !== "string") return fail("profile");
        const connectionId = await saveDiscordConnection(me.id, tokens);

        const headers = new Headers({ Location: "/" });
        headers.append(
          "Set-Cookie",
          cookie(SESSION_COOKIE, await createSession({ id: me.id, username: me.username, global_name: me.global_name, avatar: me.avatar, connectionId }), 7 * 86400),
        );
        headers.append("Set-Cookie", cookie(STATE_COOKIE, "", 0));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
