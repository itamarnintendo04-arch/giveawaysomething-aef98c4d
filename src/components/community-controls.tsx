import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { completeOnboarding, getCommunityState, getMyFeedback, sendFeedback } from "@/lib/community.functions";
import { feedbackCategories } from "@/lib/community";

export function CommunityControls({ userId, guildId, missingBot }: { userId: string; guildId: string; missingBot: boolean }) {
  const loadState = useServerFn(getCommunityState);
  const saveOnboarding = useServerFn(completeOnboarding);
  const submitFeedback = useServerFn(sendFeedback);
  const loadFeedback = useServerFn(getMyFeedback);
  const state = useQuery({ queryKey: ["community", userId], queryFn: () => loadState(), retry: false });
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [category, setCategory] = useState("feature");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const history = useQuery({ queryKey: ["my-feedback", userId], queryFn: () => loadFeedback(), enabled: feedbackOpen, retry: false });
  let invite = state.data?.inviteUrl ?? null;
  if (invite && guildId) { const url = new URL(invite); url.searchParams.set("guild_id", guildId); url.searchParams.set("disable_guild_select", "true"); invite = url.toString(); }
  async function respond(installed: boolean) {
    setBusy(true); setError(null);
    try { await saveOnboarding({ data: { botAlreadyInstalled: installed } }); setAnswer(installed); if (installed) { setWelcomeDismissed(true); void state.refetch(); } }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save your answer."); }
    finally { setBusy(false); }
  }
  return <>
    <Button variant="outline" onClick={() => { setFeedbackOpen(true); setError(null); }}><MessageSquare />Feedback</Button>
    {missingBot && invite && <Button asChild><a href={invite} target="_blank" rel="noreferrer"><ExternalLink />Invite bot to server</a></Button>}
    {state.error && <Button variant="ghost" onClick={() => void state.refetch()}>Retry welcome settings</Button>}
    <Dialog open={Boolean(state.data?.needsOnboarding && !welcomeDismissed)} onOpenChange={(open) => { if (!open) setWelcomeDismissed(true); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>Welcome to GiveawaySomething!</DialogTitle><DialogDescription>{answer === false ? "Your invitation is ready." : "Is GiveawaySomething already in your server?"}</DialogDescription></DialogHeader>
        {answer === false ? <div className="space-y-4">{invite ? <Button asChild className="w-full"><a href={invite} target="_blank" rel="noreferrer"><ExternalLink />Invite GiveawaySomething</a></Button> : <p role="alert" className="text-sm text-destructive">The invitation is unavailable. Please try again later.</p>}<Button variant="outline" className="w-full" onClick={() => { setWelcomeDismissed(true); void state.refetch(); }}>Continue to dashboard</Button></div> : <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void respond(true)}><Check />Yes, it’s already there</Button><Button variant="outline" disabled={busy} onClick={() => void respond(false)}><ExternalLink />No, invite the bot</Button></div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
    <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>Feedback</DialogTitle><DialogDescription>What would you like to share?</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(null); setSent(false); try { await submitFeedback({ data: { category, message } }); setMessage(""); setSent(true); await history.refetch(); } catch (e) { setError(e instanceof Error ? e.message : "Feedback was not saved."); } finally { setBusy(false); } }}>
          <label className="block space-y-2"><span className="text-sm font-medium">Category</span><select aria-label="Feedback category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-input p-3">{feedbackCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Message</span><textarea aria-label="Feedback message" required maxLength={5000} rows={5} value={message} onChange={(e) => { setMessage(e.target.value); setSent(false); }} className="w-full resize-y rounded-lg border border-border bg-input p-3 outline-none focus:ring-2 focus:ring-primary" /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{sent && <p role="status" className="text-sm text-success">Feedback saved. Thank you!</p>}
          <Button type="submit" disabled={busy || !message.trim()} className="w-full"><Send />{busy ? "Saving…" : "Send feedback"}</Button>
        </form>
        {history.error && <p role="alert" className="text-sm text-destructive">{history.error.message}</p>}
        {Boolean(history.data?.length) && <section className="space-y-3 border-t border-border pt-4"><h3 className="text-sm font-semibold">Your recent feedback</h3>{history.data?.map((entry) => <div key={entry.id} className="border-l-2 border-primary pl-3"><p className="text-xs text-muted-foreground">{feedbackCategories.find((item) => item.value === entry.category)?.label}</p><p className="break-words whitespace-pre-wrap text-sm">{entry.message}</p></div>)}</section>}
      </DialogContent>
    </Dialog>
  </>;
}