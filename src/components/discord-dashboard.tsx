import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Gift, Zap, Plus, RefreshCw, LogOut, ShieldAlert, Hash } from "lucide-react";
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
  const selected = (guilds.data ?? initialGuilds).find((guild) => guild.id === guildId);
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
        <label className="space-y-2"><span className="text-xs font-semibold uppercase text-muted-foreground">Server</span><select aria-label="Select server" className={selectClass} value={guildId} onChange={(event) => { setGuildId(event.target.value); setChannelId(""); setCreating(false); }}><option value="">Select a server</option>{(guilds.data ?? initialGuilds).map((guild) => <option key={guild.id} value={guild.id}>{guild.name}{!guild.botInstalled ? " · Bot not installed" : !guild.manageable ? " · No management permission" : ""}</option>)}</select></label>
        <label className="space-y-2"><span className="text-xs font-semibold uppercase text-muted-foreground">Channel</span><select aria-label="Select channel" className={selectClass} value={currentChannel} disabled={!availableChannels.length || channels.isFetching} onChange={(event) => setChannelId(event.target.value)}><option value="">{channels.isFetching ? "Loading channels…" : "Select a channel"}</option>{availableChannels.map((channel) => <option key={channel.id} value={channel.id}>#{channel.name}</option>)}</select></label>
      </section>
      {selected && (!selected.manageable || !selected.botInstalled) && <p role="status" className="mb-6 flex items-center gap-2 text-sm text-warning"><ShieldAlert className="h-4 w-4 shrink-0" />{!selected.manageable ? "You need Manage Server permission in this server." : "GiveawaySomething must be added to this server first."}</p>}
      {channels.error && <p role="alert" className="mb-6 text-sm text-destructive">{channels.error.message}</p>}
      {selected?.manageable && selected.botInstalled && channels.isSuccess && !availableChannels.length && <p role="status" className="mb-6 text-sm text-warning">No accessible channels. The bot needs View Channel, Send Messages, Embed Links, Read Message History and Add Reactions.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><div className="flex gap-2"><Button variant={tab === "giveaways" ? "secondary" : "ghost"} onClick={() => { setTab("giveaways"); setCreating(false); }}><Gift />Giveaways</Button><Button variant={tab === "drops" ? "secondary" : "ghost"} onClick={() => { setTab("drops"); setCreating(false); }}><Zap />Drops</Button></div><div className="flex gap-2"><Button variant="outline" size="icon" title="Refresh servers and channels" aria-label="Refresh servers and channels" disabled={guilds.isFetching || channels.isFetching} onClick={() => { void guilds.refetch(); if (selected?.manageable && selected.botInstalled) void channels.refetch(); }}><RefreshCw /></Button><Button disabled={!currentChannel} onClick={() => setCreating(true)}><Plus />New {tab === "giveaways" ? "giveaway" : "drop"}</Button></div></div>
      {creating ? <section className="py-8"><h2 className="font-display text-2xl font-bold">New {tab === "giveaways" ? "giveaway" : "drop"}</h2><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4" />{availableChannels.find((channel) => channel.id === currentChannel)?.name}</p><div role="status" className="mt-6 border-l-2 border-warning pl-4"><h3 className="font-semibold">Bot connection pending</h3><p className="mt-2 max-w-lg text-sm text-muted-foreground">Creation is unavailable until the existing bot is connected.</p></div><Button className="mt-6" variant="outline" onClick={() => setCreating(false)}>Back to active {tab}</Button></section> : <section className="py-8"><h2 className="font-display text-2xl font-bold">Active {tab}</h2><div role="status" className="flex flex-col items-center gap-3 py-16 text-center">{tab === "giveaways" ? <Gift className="h-10 w-10 text-success" /> : <Zap className="h-10 w-10 text-warning" />}<h3 className="text-lg font-semibold">Bot connection pending</h3><p className="max-w-md text-sm text-muted-foreground">Active {tab} cannot be loaded until the existing bot is connected.</p></div></section>}
    </main>
  );
}