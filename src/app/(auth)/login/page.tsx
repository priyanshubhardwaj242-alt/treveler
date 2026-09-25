"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push("/dashboard");
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-6">Log in to keep planning.</p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full btn-outline mb-4 flex items-center justify-center gap-2"
            type="button"
          >
            Continue with Google
          </button>
          <p className="text-xs text-center text-harbor/40 mb-4">— or —</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="field-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
            <input className="field-input" type="password" autoComplete="current-password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p className="text-xs text-coral-dark" role="alert">{error}</p>}
            <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="flex justify-between text-xs mt-5 text-harbor/60 dark:text-[#A9BBB5]">
            <Link href="/forgot-password" className="hover:text-coral">Forgot password?</Link>
            <Link href="/signup" className="hover:text-coral">Create an account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
