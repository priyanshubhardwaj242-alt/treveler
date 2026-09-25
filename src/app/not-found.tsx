import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">404</div>
        <h1 className="font-display text-3xl font-semibold mb-3">This route doesn't exist</h1>
        <p className="text-harbor/60 dark:text-[#A9BBB5] mb-8 max-w-sm mx-auto">
          Whatever you were looking for isn't here — maybe a saved trip that was deleted, or a mistyped link.
        </p>
        <Link href="/" className="btn-primary">Back to Waypoint</Link>
      </div>
    </main>
  );
}
