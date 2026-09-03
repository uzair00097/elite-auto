"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import PageSpinner from "@/components/PageSpinner";

export default function VerifyPhonePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const sendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await api.sendPhoneOtp();
      setDemoCode(res.code);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send verification code");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user && !user.phone_verified && !sent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      await api.verifyPhoneOtp(code);
      await refreshUser();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (loading || !user) return <PageSpinner />;

  if (user.phone_verified) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Your phone is already verified ✓</h1>
        <Link href="/" className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-800">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold text-slate-900">Verify your phone</h1>
        <p className="mt-1 text-sm text-slate-500">
          We sent a 6-digit code to <span className="font-medium text-slate-700">{user.phone}</span>.
        </p>

        {demoCode && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <p className="font-medium">Demo mode — no SMS provider is configured.</p>
            <p className="mt-1">
              Your code is <span className="font-mono text-base font-bold">{demoCode}</span>
            </p>
          </div>
        )}

        <form onSubmit={onVerify} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Verification code</label>
            <input
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={sendCode} disabled={sending} className="font-medium text-blue-700 hover:text-blue-800">
            {sending ? "Sending…" : "Resend code"}
          </button>
          <Link href="/" className="text-slate-500 hover:text-slate-700">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
