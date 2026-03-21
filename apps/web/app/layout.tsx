import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Trawell",
  description: "Geo-fenced audio tours",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:max-w-3xl">{children}</div>
      </body>
    </html>
  );
}

