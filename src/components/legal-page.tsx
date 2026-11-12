import { Link } from "@tanstack/react-router";
export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← GiveawaySomething</Link>
      <h1 className="mt-6 font-display text-4xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="glass mt-8 space-y-6 rounded-xl p-6 sm:p-8">
        {sections.map((s) => (<section key={s.h}><h2 className="font-display text-xl font-semibold">{s.h}</h2><p className="mt-2 text-muted-foreground">{s.p}</p></section>))}
      </div>
    </main>
  );
}
