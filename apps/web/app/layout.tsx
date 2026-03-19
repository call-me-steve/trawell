import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Trawell",
  description: "Geo-fenced audio tours",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}

