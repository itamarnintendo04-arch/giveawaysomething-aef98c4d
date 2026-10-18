import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

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
  component: Index,
});

const SERVERS = ["Pixel Raiders", "Late Night Gamers", "Valorant Hub", "Minecraft Builders"];
const CHANNELS = ["#giveaways", "#general", "#announcements", "#drops", "#events"];

function DiscordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.8a13.8 13.8 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.53 0 13 13 0 0 0-.64-1.3 19.7 19.7 0 0 0-4.92 1.53C.56 9.04-.29 13.6.13 18.1a19.9 19.9 0 0 0 6.03 3.05c.49-.66.92-1.37 1.3-2.1a12.9 12.9 0 0 1-2.05-.98c.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.18 0l.5.4c-.65.39-1.34.72-2.05.98.38.74.81 1.44 1.3 2.1a19.8 19.8 0 0 0 6.03-3.05c.5-5.2-.84-9.72-3.55-13.73ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.19 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

const inputCls =
  "w-full rounded-xl bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="glass mb-8 flex h-20 w-20 items-center justify-center rounded-2xl shadow-glow text-4xl">🎁</div>
      <h1 className="text-gradient font-display text-5xl font-black tracking-tight sm:text-7xl">GiveawaySomething</h1>
      <p className="mt-5 max-w-md text-lg text-muted-foreground">
        The ultimate giveaway & quick-drop bot for your Discord server.
      </p>
      <button
        onClick={onLogin}
        className="mt-10 inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
      >
        <DiscordIcon className="h-6 w-6" />
        Login with Discord
      </button>
    </main>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [server, setServer] = useState(SERVERS[0]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [gPrize, setGPrize] = useState("");
  const [duration, setDuration] = useState("");
  const [winners, setWinners] = useState(1);
  const [dPrize, setDPrize] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <header className="glass flex items-center justify-between rounded-xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <DiscordIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GiveawaySomething</p>
            <h2 className="font-display text-lg font-bold">Welcome, Admin!</h2>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Logout
        </button>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Select Server">
          <select className={inputCls} value={server} onChange={(e) => setServer(e.target.value)}>
            {SERVERS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Select Channel">
          <select className={inputCls} value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => { e.preventDefault(); flash(`🎉 Giveaway "${gPrize || "Mystery prize"}" launched in ${channel}`); }}
          className="glass space-y-5 rounded-xl p-6 transition hover:-translate-y-1 hover:border-success/50"
        >
          <h3 className="font-display text-2xl font-bold">🎉 Start a Giveaway</h3>
          <Field label="Prize"><input className={inputCls} value={gPrize} onChange={(e) => setGPrize(e.target.value)} placeholder="Discord Nitro" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration"><input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="10m, 2h" /></Field>
            <Field label="Winners"><input type="number" min={1} className={inputCls} value={winners} onChange={(e) => setWinners(Number(e.target.value))} /></Field>
          </div>
          <button className="w-full rounded-xl bg-success py-3 font-semibold text-success-foreground transition hover:shadow-success hover:brightness-110">
            Launch Giveaway
          </button>
        </form>

        <form
          onSubmit={(e) => { e.preventDefault(); flash(`⚡ Drop "${dPrize || "Mystery prize"}" launched in ${channel}`); }}
          className="glass flex flex-col space-y-5 rounded-xl p-6 transition hover:-translate-y-1 hover:border-warning/50"
        >
          <h3 className="font-display text-2xl font-bold">⚡ Quick Drop</h3>
          <p className="text-sm text-muted-foreground">First to react wins instantly. Fast and furious.</p>
          <Field label="Prize"><input className={inputCls} value={dPrize} onChange={(e) => setDPrize(e.target.value)} placeholder="Steam gift card" /></Field>
          <div className="flex-1" />
          <button className="w-full rounded-xl bg-warning py-3 font-semibold text-warning-foreground transition hover:shadow-warning hover:brightness-105">
            Launch Drop
          </button>
        </form>
      </section>

      {toast && (
        <div className="glass fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-sm shadow-glow animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}

function Index() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <Dashboard onLogout={() => setLoggedIn(false)} /> : <Login onLogin={() => setLoggedIn(true)} />;
}
