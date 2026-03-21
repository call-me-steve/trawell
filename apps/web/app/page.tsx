export default function HomePage() {
  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Trawell</h1>
        <p className="text-zinc-400">
          Location-based audio tours. Creators attach audio to a geo fence; listeners can play only when they’re there.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        <a
          className="rounded border border-zinc-700 p-5 hover:bg-zinc-900/60"
          href="/login?mode=listener"
        >
          <div className="text-lg font-medium">Listener</div>
          <div className="mt-1 text-sm text-zinc-400">Explore map, tap markers, listen when you’re there.</div>
        </a>
        <a
          className="rounded border border-zinc-700 p-5 hover:bg-zinc-900/60"
          href="/login?mode=creator"
        >
          <div className="text-lg font-medium">Creator</div>
          <div className="mt-1 text-sm text-zinc-400">Upload audio, place on map, build tours.</div>
        </a>
      </section>
    </main>
  );
}

