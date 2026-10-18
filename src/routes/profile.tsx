import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getMe } from "@/lib/auth.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — GiveawaySomething" },
      { name: "description", content: "Your Discord profile on GiveawaySomething." },
      { property: "og:title", content: "Your Profile — GiveawaySomething" },
      { property: "og:description", content: "Your Discord profile on GiveawaySomething." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => {
    const me = await getMe();
    if (!me) throw redirect({ to: "/" });
    return me;
  },
  component: Profile,
});

function Profile() {
  const me = Route.useLoaderData();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="glass w-full rounded-xl p-8">
        <img src={me.avatarUrl} alt="" className="mx-auto h-28 w-28 rounded-full ring-4 ring-primary shadow-glow" />
        <h1 className="mt-5 font-display text-3xl font-bold">{me.displayName}</h1>
        <p className="text-muted-foreground">@{me.username}</p>
        <p className="mt-2 text-xs text-muted-foreground">ID: {me.id}</p>
        <div className="mt-8 grid gap-3">
          <a
            href={`https://discord.com/users/${me.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
          >
            Open in Discord
          </a>
          <Link to="/" className="rounded-xl border border-border bg-secondary py-3 font-medium transition hover:bg-accent">
            Back to dashboard
          </Link>
          <a href="/api/public/auth/logout" className="py-2 text-sm text-muted-foreground transition hover:text-destructive">
            Logout
          </a>
        </div>
      </div>
    </main>
  );
}
