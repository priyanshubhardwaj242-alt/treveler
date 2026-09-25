"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({ variant = "default" }: { variant?: "default" | "hero" }) {
  const { data: session } = useSession();
  const isHero = variant === "hero";
  return (
    <nav
      className={
        isHero
          ? "absolute top-0 left-0 right-0 z-50"
          : "sticky top-0 z-50 backdrop-blur-md bg-sand/80 dark:bg-[#0E1B1D]/80 border-b border-mist dark:border-[#28403F]"
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <div className={`max-w-6xl mx-auto px-7 py-5 flex items-center justify-between ${isHero ? "text-[#EFEAE0]" : ""}`}>
        <Logo />
        <div className="flex items-center gap-3.5">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/trips" className={isHero ? "btn-outline-hero" : "btn-outline"}>My trips</Link>
              <Link href="/dashboard" className={isHero ? "btn-outline-hero" : "btn-outline"}>Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className={isHero ? "btn-outline-hero" : "btn-outline"}>Log in</Link>
              <Link href="/signup" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
