import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Gift, Zap, Plus, RefreshCw, LogOut, ShieldAlert } from "lucide-react";
import { GiveawayManager } from "@/components/giveaway-manager";
import { Button } from "@/components/ui/button";
import { getDiscordChannels, getDiscordGuilds } from "@/lib/discord.functions";
import type { Me } from "@/lib/auth.functions";
import brandImage from "@/assets/giveawaysomething-logo.png.asset.json";
import { CommunityControls } from "@/components/community-controls";

type Guild = Awaited<ReturnType<typeof getDiscordGuilds>>[number];
const selectClass = "w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50";

export function DiscordDashboard({ me, initialGuilds, connectionError }: { me: Me; initialGuilds: Guild[]; connectionError: string | null }) {
  const [guildId, setGuildId] = useState(initialGuilds.find((guild) => guild.manageable && guild.botInstalled)?.id ?? "");
  const [channelId, setChannelId] = useState("");
  const [tab, setTab] = useState<"giveaways" | "drops">("giveaways");
  const [creating, setCreating] = useState(false);
  const fetchGuilds = useServerFn(getDiscordGuilds);
  const fetchChannels = useServerFn(getDiscordChannels);
  const guilds = useQuery({ queryKey: ["discord-guilds", me.id], queryFn: () => fetchGuilds(), initialData: connectionError ? undefined : initialGuilds, enabled: false });
  const managedGuilds = (guilds.data ?? initialGuilds).filter((guild) => guild.manageable);
  const selected = managedGuilds.find((guild) => guild.id === guildId);
  const channels = useQuery({ queryKey: ["discord-channels", me.id, guildId], queryFn: () => fetchChannels({ data: { guildId } }), enabled: Boolean(selected?.manageable && selected.botInstalled), retry: false });
  const availableChannels = channels.data ?? [];
  const currentChannel = availableChannels.find((channel) => channel.id === channelId)?.id ?? availableChannels[0]?.id ?? "";
  const error = guilds.error?.message ?? connectionError;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex min-w-0 items-center gap-3"><img src={brandImage.url} alt="" className="h-12 w-12 shrink-0 object-contain" /><div className="min-w-0"><h1 className="break-words font-display text-xl font-bold sm:text-2xl">GiveawaySomething</h1><p className="text-sm text-muted-foreground">Welcome, {me.displayName}</p></div></div>
        <div className="flex flex-wrap items-center gap-3"><CommunityControls userId={me.id} guildId={selected?.manageable ? guildId : ""} missingBot={Boolean(selected?.manageable && !selected.botInstalled)} /><Button asChild variant="ghost"><a href="/api/public/auth/logout"><LogOut />Logout</a></Button><Link to="/profile" aria-label="Your profile"><img src={me.avatarUrl} alt="" className="h-10 w-10 rounded-full ring-2 ring-primary" /></Link></div>
      </header>
      {error && <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4"><p className="text-sm">{error}</p><Button asChild><a href="/api/public/auth/login">Reconnect Discord</a></Button></div>}
      <section className="grid gap-5 py-7 sm:grid-cols-2">
        <label className="space-y-2"><span className="text-xs font-semibold uppercase text-muted-foreground">Server</span><select aria-label="Select server" className={selectClass} value={selected?.id ?? ""} onChange={(event) => { setGuildId(event.target.value); setChannelId(""); setCreating(false); }}><option value="">Select a server</option>{managedGuilds.map((guild) => <option key={guild.id} value={guild.id}>{guild.name}{!guild.botInstalled ? " · Bot not installed" : ""}</option>)}</select></label>
        <label className="space-y-2"><span className="text-xs font-semibold uppercase text-muted-foreground">Channel</span><select aria-label="Select channel" className={selectClass} value={currentChannel} disabled={!availableChannels.length || channels.isFetching} onChange={(event) => setChannelId(event.target.value)}><option value="">{channels.isFetching ? "Loading channels…" : "Select a channel"}</option>{availableChannels.map((channel) => <option key={channel.id} value={channel.id}>#{channel.name}</option>)}</select></label>
      </section>
      {selected && (!selected.manageable || !selected.botInstalled) && <p role="status" className="mb-6 flex items-center gap-2 text-sm text-warning"><ShieldAlert className="h-4 w-4 shrink-0" />{!selected.manageable ? "You need Manage Server permission in this server." : "GiveawaySomething must be added to this server first."}</p>}
      {channels.error && <p role="alert" className="mb-6 text-sm text-destructive">{channels.error.message}</p>}
      {selected?.manageable && selected.botInstalled && channels.isSuccess && !availableChannels.length && <p role="status" className="mb-6 text-sm text-warning">No accessible channels. The bot needs View Channel, Send Messages, Embed Links, Read Message History and Add Reactions.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><div className="flex gap-2"><Button variant={tab === "giveaways" ? "secondary" : "ghost"} onClick={() => { setTab("giveaways"); setCreating(false); }}><Gift />Giveaways</Button><Button variant={tab === "drops" ? "secondary" : "ghost"} onClick={() => { setTab("drops"); setCreating(false); }}><Zap />Drops</Button></div><div className="flex gap-2"><Button variant="outline" size="icon" title="Refresh servers and channels" aria-label="Refresh servers and channels" disabled={guilds.isFetching || channels.isFetching} onClick={() => { void guilds.refetch(); if (selected?.manageable && selected.botInstalled) void channels.refetch(); }}><RefreshCw /></Button><Button disabled={!currentChannel} onClick={() => setCreating(true)}><Plus />New {tab === "giveaways" ? "giveaway" : "drop"}</Button></div></div>
      {selected?.manageable && selected.botInstalled ? <GiveawayManager key={selected.id} guildId={selected.id} channels={availableChannels} channelId={currentChannel} tab={tab} creating={creating} setCreating={setCreating} /> : <section className="glass mt-8 rounded-xl py-16 text-center"><h2 className="font-display text-xl font-semibold">Select a server to begin</h2><p className="mt-2 text-sm text-muted-foreground">Choose a server you manage where GiveawaySomething is installed.</p></section>}
    </main>
  );
}