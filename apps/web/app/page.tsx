export default function HomePage() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Trawell</h1>
        <p className="text-zinc-300">
          Location-based audio tours. Creators attach audio to a geo fence; listeners can play only when they’re there.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        <a
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/70"
          href="/listen"
        >
          <div className="text-lg font-medium">Listener</div>
          <div className="mt-1 text-sm text-zinc-300">Find nearby audio and tours, then listen on-location.</div>
        </a>
        <a
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/70"
          href="/creator"
        >
          <div className="text-lg font-medium">Creator</div>
          <div className="mt-1 text-sm text-zinc-300">Upload audio, attach it to a geo, and build tours.</div>
        </a>
      </section>
    </main>
  );
}

