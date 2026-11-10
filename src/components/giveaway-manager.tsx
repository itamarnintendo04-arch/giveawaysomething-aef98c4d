import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Gift, Hash, Plus, RefreshCw, Trash2, Trophy, UserMinus, Users, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createDrop, createGiveaway, endGiveaway, getBotState, removeGiveawayParticipant } from "@/lib/giveaways.functions";
import type { Giveaway } from "@/lib/bot-api";

const inputClass = "w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50";
type Channel = { id: string; name: string };

export function GiveawayManager({ guildId, channels, channelId, tab, creating, setCreating }: {
  guildId: string;
  channels: Channel[];
  channelId: string;
  tab: "giveaways" | "drops";
  creating: boolean;
  setCreating: (value: boolean) => void;
}) {
  const loadState = useServerFn(getBotState);
  const launchGiveaway = useServerFn(createGiveaway);
  const launchDrop = useServerFn(createDrop);
  const finishGiveaway = useServerFn(endGiveaway);
  const removeParticipant = useServerFn(removeGiveawayParticipant);
  const state = useQuery({ queryKey: ["bot-state", guildId], queryFn: () => loadState({ data: { guildId } }), retry: false, refetchInterval: 30_000 });
  const [prize, setPrize] = useState("");
  const [duration, setDuration] = useState("10m");
  const [winners, setWinners] = useState(1);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedGiveaway = state.data?.giveaways.find((giveaway) => giveaway.messageId === selectedId) ?? null;
  const channelName = (id: string) => channels.find((channel) => channel.id === id)?.name ?? "Unavailable channel";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setActionError(null);
    try {
      if (tab === "giveaways") await launchGiveaway({ data: { guildId, channelId, prize, duration, winners } });
      else await launchDrop({ data: { guildId, channelId, prize } });
      setPrize("");
      setDuration("10m");
      setWinners(1);
      setCreating(false);
      await state.refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The bot could not create it.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(giveaway: Giveaway) {
    if (!window.confirm(`End the giveaway for “${giveaway.prize}” and choose winners now?`)) return;
    setBusy(true);
    setActionError(null);
    try {
      await finishGiveaway({ data: { guildId, messageId: giveaway.messageId } });
      setSelectedId(null);
      await state.refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The giveaway could not be ended.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string) {
    if (!selectedGiveaway) return;
    setBusy(true);
    setActionError(null);
    try {
      await removeParticipant({ data: { guildId, messageId: selectedGiveaway.messageId, userId } });
      await state.refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The participant could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  if (creating) {
    return (
      <section className="py-8">
        <div className="glass mx-auto max-w-2xl rounded-xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-display text-2xl font-bold">{tab === "giveaways" ? "🎉 Start a Giveaway" : "⚡ Quick Drop"}</h2><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4" />{channelName(channelId)}</p></div>
            <Button variant="ghost" size="icon" aria-label="Close creation form" onClick={() => setCreating(false)}><X /></Button>
          </div>
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <label className="block space-y-2"><span className="text-sm font-medium">Prize</span><input aria-label="Prize" required maxLength={200} value={prize} onChange={(event) => setPrize(event.target.value)} placeholder="Discord Nitro" className={inputClass} /></label>
            {tab === "giveaways" && <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2"><span className="text-sm font-medium">Duration</span><input aria-label="Duration" required value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="10m, 2h, 1d" className={inputClass} /></label>
              <label className="block space-y-2"><span className="text-sm font-medium">Number of winners</span><input aria-label="Number of winners" required type="number" min={1} max={25} value={winners} onChange={(event) => setWinners(event.target.valueAsNumber)} className={inputClass} /></label>
            </div>}
            {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
            <Button type="submit" disabled={busy || !channelId || !prize.trim()} className={`w-full rounded-xl py-6 text-base ${tab === "giveaways" ? "bg-success text-success-foreground shadow-success hover:bg-success/90" : "bg-warning text-warning-foreground shadow-warning hover:bg-warning/90"}`}>
              {tab === "giveaways" ? <Gift /> : <Zap />}{busy ? "Launching…" : tab === "giveaways" ? "Launch Giveaway" : "Launch Drop"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  const items = tab === "giveaways" ? state.data?.giveaways : state.data?.drops;
  return (
    <section className="py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-display text-2xl font-bold">Active {tab}</h2><p className="mt-1 text-sm text-muted-foreground">Live data from your GiveawaySomething bot.</p></div>
        <Button variant="outline" size="sm" disabled={state.isFetching} onClick={() => { setActionError(null); void state.refetch(); }}><RefreshCw className={state.isFetching ? "animate-spin" : ""} />Refresh</Button>
      </div>
      {(state.error || actionError) && <div role="alert" className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{actionError ?? state.error?.message}</div>}
      {state.isPending ? <div role="status" className="glass rounded-xl py-16 text-center text-muted-foreground">Loading active {tab}…</div> : !state.error && !items?.length ? (
        <div className="glass flex flex-col items-center gap-3 rounded-xl py-16 text-center">
          {tab === "giveaways" ? <Gift className="h-10 w-10 text-success" /> : <Zap className="h-10 w-10 text-warning" />}
          <h3 className="text-lg font-semibold">No active {tab}</h3><p className="max-w-md text-sm text-muted-foreground">Create one in #{channelName(channelId)} and it will appear here.</p>
          <Button className="mt-2" disabled={!channelId} onClick={() => setCreating(true)}><Plus />New {tab === "giveaways" ? "giveaway" : "drop"}</Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tab === "giveaways" ? state.data?.giveaways.map((giveaway) => (
            <article key={giveaway.messageId} className="glass rounded-xl p-5 transition hover:border-primary/50">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-display text-xl font-bold">{giveaway.prize}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4 shrink-0" />{channelName(giveaway.channelId)}</p></div><Gift className="h-6 w-6 shrink-0 text-success" /></div>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Users />Inside</dt><dd className="mt-1 font-semibold">{giveaway.participants.length}</dd></div>
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Trophy />Winners</dt><dd className="mt-1 font-semibold">{giveaway.winnersCount}</dd></div>
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Clock />Ends</dt><dd className="mt-1 font-semibold">{new Date(giveaway.endTime * 1000).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">Hosted by {giveaway.hostName}</p>
              <div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { setSelectedId(giveaway.messageId); setActionError(null); }}><Users />View participants</Button><Button variant="destructive" size="sm" disabled={busy} onClick={() => void finish(giveaway)}>End now</Button></div>
            </article>
          )) : state.data?.drops.map((drop) => (
            <article key={drop.messageId} className="glass rounded-xl p-5 transition hover:border-warning/50">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-display text-xl font-bold">{drop.prize}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4 shrink-0" />{channelName(drop.channelId)}</p></div><Zap className="h-6 w-6 shrink-0 text-warning" /></div>
              <p className="mt-5 text-sm"><span className="font-semibold text-success">Waiting for a claim</span> · First click wins</p>
              <p className="mt-2 text-xs text-muted-foreground">Hosted by {drop.hostName} · {new Date(drop.createdAt * 1000).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p>
            </article>
          ))}
        </div>
      )}
      <Dialog open={Boolean(selectedGiveaway)} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl">
          <DialogHeader><DialogTitle>Participants · {selectedGiveaway?.prize}</DialogTitle><DialogDescription>{selectedGiveaway?.participants.length ?? 0} people inside. Remove someone only when necessary.</DialogDescription></DialogHeader>
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          {!selectedGiveaway?.participants.length ? <p className="py-8 text-center text-sm text-muted-foreground">Nobody has joined yet.</p> : <ul className="divide-y divide-border">{selectedGiveaway.participants.map((participant) => <li key={participant.id} className="flex items-center gap-3 py-3">
            {participant.avatarUrl ? <img src={participant.avatarUrl} alt="" className="h-9 w-9 rounded-full" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Users /></span>}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{participant.displayName}</p><p className="truncate text-xs text-muted-foreground">@{participant.username}</p></div>
            <Button variant="ghost" size="sm" disabled={busy} aria-label={`Remove ${participant.displayName}`} onClick={() => void remove(participant.id)}><UserMinus /><span className="hidden sm:inline">Remove</span></Button>
          </li>)}</ul>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
