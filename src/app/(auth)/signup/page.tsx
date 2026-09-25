"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) setError("Account created — please log in.");
    else router.push("/dashboard");
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-6">Start planning in minutes.</p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full btn-outline mb-4"
            type="button"
          >
            Continue with Google
          </button>
          <p className="text-xs text-center text-harbor/40 mb-4">— or —</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="field-input" type="text" autoComplete="name" placeholder="Full name" required value={name} onChange={e => setName(e.target.value)} />
            <input className="field-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
            <input className="field-input" type="password" autoComplete="new-password" placeholder="Password (min 8 characters)" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
            {password.length > 0 && (
              <ul className="text-xs space-y-1 -mt-2" aria-live="polite">
                <li className={password.length >= 8 ? "text-moss" : "text-harbor/40 dark:text-[#A9BBB5]"}>
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-moss" : "text-harbor/40 dark:text-[#A9BBB5]"}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter (recommended)
                </li>
                <li className={/[0-9]/.test(password) ? "text-moss" : "text-harbor/40 dark:text-[#A9BBB5]"}>
                  {/[0-9]/.test(password) ? "✓" : "○"} One number (recommended)
                </li>
              </ul>
            )}
            {error && <p className="text-xs text-coral-dark" role="alert">{error}</p>}
            <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <div className="text-xs mt-5 text-center text-harbor/60 dark:text-[#A9BBB5]">
            Already have an account? <Link href="/login" className="hover:text-coral font-semibold">Log in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
