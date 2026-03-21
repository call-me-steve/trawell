"use client";

import Link from "next/link";

export function Nav() {
  return (
    <nav className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
      <Link href="/" className="text-lg font-medium">
        Trawell
      </Link>
      <div className="flex gap-2">
        <Link
          href="/creator"
          className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Creator
        </Link>
        <Link
          href="/listen"
          className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Listener
        </Link>
      </div>
    </nav>
  );
}
