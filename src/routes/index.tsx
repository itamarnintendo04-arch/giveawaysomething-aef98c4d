import { createFileRoute } from "@tanstack/react-router";
import { getMe } from "@/lib/auth.functions";
import { getDiscordGuilds } from "@/lib/discord.functions";
import { DiscordDashboard } from "@/components/discord-dashboard";
import brandImage from "@/assets/giveawaysomething-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiveawaySomething — Discord Giveaway Bot Dashboard" },
      { name: "description", content: "The ultimate giveaway & quick-drop bot for your Discord server." },
      { property: "og:title", content: "GiveawaySomething Dashboard" },
      { property: "og:description", content: "The ultimate giveaway & quick-drop bot for your Discord server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const me = await getMe();
    if (!me) return { me: null, guilds: [], connectionError: null };
    try {
      return { me, guilds: await getDiscordGuilds(), connectionError: null };
    } catch (error) {
      return { me, guilds: [], connectionError: error instanceof Error ? error.message : "Could not load Discord servers." };
    }
  },
  component: Index,
});

function DiscordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.8a13.8 13.8 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.53 0 13 13 0 0 0-.64-1.3 19.7 19.7 0 0 0-4.92 1.53C.56 9.04-.29 13.6.13 18.1a19.9 19.9 0 0 0 6.03 3.05c.49-.66.92-1.37 1.3-2.1a12.9 12.9 0 0 1-2.05-.98c.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.18 0l.5.4c-.65.39-1.34.72-2.05.98.38.74.81 1.44 1.3 2.1a19.8 19.8 0 0 0 6.03-3.05c.5-5.2-.84-9.72-3.55-13.73ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.19 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

const FEATURES = [
  { icon: "🎉", title: "Timed giveaways", text: "Set a prize, duration and winner count. The bot picks winners fairly and automatically." },
  { icon: "⚡", title: "Quick drops", text: "First to react wins. Perfect for keeping chat hyped and active." },
  { icon: "🛡️", title: "Fair & transparent", text: "Random, unbiased winner selection your community can trust." },
  { icon: "🎛️", title: "Easy dashboard", text: "Launch everything from here — no commands to memorize." },
];

function Login() {
  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="flex min-w-0 items-center gap-2 font-display text-sm font-bold sm:text-lg"><img src={brandImage.url} alt="" className="h-9 w-9 shrink-0 rounded-md object-contain" /> GiveawaySomething</span>
        <a href="/api/public/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
          <DiscordIcon className="h-4 w-4" /> Login
        </a>
      </nav>
      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="flex flex-col items-center py-16 text-center">
          <img src={brandImage.url} alt="GiveawaySomething — colorful gift box" width={268} height={268} className="mb-8 h-40 w-40 rounded-xl object-contain shadow-glow sm:h-48 sm:w-48" />
          <h1 className="text-gradient font-display text-5xl font-black tracking-tight sm:text-7xl">GiveawaySomething</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">The ultimate giveaway & quick-drop bot for your Discord server.</p>
          <a href="/api/public/auth/login" className="mt-10 inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:brightness-110">
            <DiscordIcon className="h-6 w-6" /> Login with Discord
          </a>
        </section>

        <section className="glass rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">What is GiveawaySomething?</h2>
          <p className="mt-3 text-muted-foreground">
            GiveawaySomething is a Discord bot that runs giveaways and instant prize drops in your server. Reward your members,
            grow engagement and celebrate milestones — all in a few clicks.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-center font-display text-2xl font-bold">Why use it?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-xl p-5 transition hover:-translate-y-1 hover:border-primary/50">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-2 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass mt-10 rounded-xl p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl font-bold">✅ A bot you can trust</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            GiveawaySomething is listed and reviewed on the biggest Discord bot directories, so you know it's safe to add to your server.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="https://top.gg" target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-secondary px-5 py-3 font-semibold transition hover:border-primary hover:bg-accent">Listed on Top.gg</a>
            <a href="https://discordbotlist.com" target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-secondary px-5 py-3 font-semibold transition hover:border-primary hover:bg-accent">Listed on Discord Bot List</a>
          </div>
        </section>
      </main>
    </div>
  );
}

function Index() {
  const { me, guilds, connectionError } = Route.useLoaderData();
  return me ? <DiscordDashboard me={me} initialGuilds={guilds} connectionError={connectionError} /> : <Login />;
}
