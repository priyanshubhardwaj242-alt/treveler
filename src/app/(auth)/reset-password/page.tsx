"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <p className="text-sm text-red-700 dark:text-red-300">
        This reset link is missing its token. Please use the link from your email, or{" "}
        <Link href="/forgot-password" className="underline font-semibold">request a new one</Link>.
      </p>
    );
  }

  if (done) {
    return <p className="text-sm">Password updated — redirecting you to log in…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="field-input" type="password" placeholder="New password" required minLength={8}
        autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
      />
      <input
        className="field-input" type="password" placeholder="Confirm new password" required minLength={8}
        autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)}
      />
      {error && <p className="text-xs text-coral-dark">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Updating…" : "Set new password"}</button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Set a new password</h1>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-6">Choose something you haven't used before.</p>
          <Suspense fallback={<p className="text-sm text-harbor/60">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
