"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Globe2, LockKeyhole, Mail, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "sign-in" | "sign-up";

const inputStyles =
  "w-full rounded-md border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithPassword, signUp, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error: authError } = await signInWithPassword(email.trim(), password);
        if (authError) {
          setError(authError.message);
        } else {
          onClose();
        }
      } else {
        const { data, error: authError } = await signUp(email.trim(), password);
        if (authError) {
          setError(authError.message);
        } else if (data.session) {
          onClose();
        } else {
          setNotice("Check your inbox to confirm your email address.");
        }
      }
    } catch {
      setError("Authentication could not be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setIsSubmitting(true);

    try {
      const { error: authError } = await signInWithOAuth("google");
      if (authError) setError(authError.message);
    } catch {
      setError("Google sign-in could not be started. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearMessages();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="relative my-auto w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          type="button"
          aria-label="Close sign-in dialog"
          className="absolute right-4 top-4 rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          onClick={onClose}
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="mb-6 pr-8">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </span>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-white">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "sign-in"
              ? "Sign in to sync your progress across devices."
              : "Save your answers and bookmarks as you practice."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            aria-pressed={mode === "sign-in"}
            className={`rounded px-3 py-2 text-sm font-semibold transition ${mode === "sign-in" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
            onClick={() => selectMode("sign-in")}
          >
            Sign in
          </button>
          <button
            type="button"
            aria-pressed={mode === "sign-up"}
            className={`rounded px-3 py-2 text-sm font-semibold transition ${mode === "sign-up" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
            onClick={() => selectMode("sign-up")}
          >
            Create account
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {notice && (
          <p role="status" className="mb-4 flex gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-slate-200">
              Email address
            </label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-email"
                autoComplete="email"
                className={inputStyles}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                className={inputStyles}
                type="password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Use at least 6 characters.</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Globe2 aria-hidden="true" className="h-4 w-4" />
          Continue with Google
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-md px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Continue as guest
        </button>
      </section>
    </div>
  );
}