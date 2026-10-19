import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { cookie, STATE_COOKIE } = await import("@/lib/session.server");
        const origin = new URL(request.url).origin;
        const state = crypto.randomUUID();
        const params = new URLSearchParams({
          client_id: process.env["DISCORD_CLIENT_ID"] ?? "",
          response_type: "code",
          redirect_uri: `${origin}/api/public/auth/callback`,
          scope: "identify guilds",
          state,
        });
        return new Response(null, {
          status: 302,
          headers: {
            Location: `https://discord.com/oauth2/authorize?${params}`,
            "Set-Cookie": cookie(STATE_COOKIE, state, 600),
          },
        });
      },
    },
  },
});
