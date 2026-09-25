"use client";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;
    await fetch("/api/auth/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setSent(true);
    setCooldown(30);
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Reset your password</h1>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-6">
            We'll email you a reset link.
          </p>
          {sent && (
            <p className="text-sm mb-4" role="status">
              If an account exists for that email, a reset link is on its way. Check your spam folder if it doesn't arrive in a minute.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="field-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
            <button className="btn-primary w-full" disabled={cooldown > 0}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : sent ? "Resend link" : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
