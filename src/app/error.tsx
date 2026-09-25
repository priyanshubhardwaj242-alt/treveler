"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">Something went wrong</div>
        <h1 className="font-display text-3xl font-semibold mb-3">This page hit an unexpected error</h1>
        <p className="text-harbor/60 dark:text-[#A9BBB5] mb-8 max-w-sm mx-auto">
          Your trip data is safe — this was a rendering error, not a data loss. Try again, or head back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-outline">Go home</Link>
        </div>
      </div>
    </main>
  );
}
