import { createFileRoute } from "@tanstack/react-router";
import { cookie, SESSION_COOKIE } from "@/lib/session.server";

export const Route = createFileRoute("/api/public/auth/logout")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 302,
          headers: { Location: "/", "Set-Cookie": cookie(SESSION_COOKIE, "", 0) },
        }),
    },
  },
});
