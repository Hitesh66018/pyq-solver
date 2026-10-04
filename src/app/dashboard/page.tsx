"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  CircleHelp,
  LockKeyhole,
  Target,
  Trophy,
} from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import { useAuth } from "@/context/AuthContext";
import { questionSets } from "@/lib/questions";
import { supabase } from "@/lib/supabase";

interface UserAttempt {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  is_bookmarked: boolean;
}

const questionLookup = new Map(
  questionSets.flatMap((set) =>
    set.questions.map((question) => [question.id, { question, set }] as const),
  ),
);

export default function DashboardPage() {
  const { user, loading, openAuthModal } = useAuth();
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;

    let isCurrent = true;

    const loadAttempts = async () => {
      try {
        const { data, error } = await supabase
          .from("user_attempts")
          .select("question_id, selected_option, is_correct, is_bookmarked")
          .eq("user_id", user.id);

        if (error) throw error;
        if (isCurrent) {
          setAttempts((data ?? []) as UserAttempt[]);
          setLoadError(null);
          setLoadedForUser(user.id);
        }
      } catch {
        if (isCurrent) {
          setAttempts([]);
          setLoadError("Your progress could not be loaded. Please try again later.");
          setLoadedForUser(user.id);
        }
      }
    };

    void loadAttempts();

    return () => {
      isCurrent = false;
    };
  }, [loading, user]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-950 px-4 text-sm text-slate-400" role="status">
        Loading your account...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
        <section className="w-full max-w-md border-y border-slate-800 py-10 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-white">Your progress, in one place</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
            Sign in to see your attempts, accuracy, score, and saved questions.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <LockKeyhole aria-hidden="true" className="h-4 w-4" />
            Sign in to continue
          </button>
        </section>
      </main>
    );
  }

  const isLoadingAttempts = loadedForUser !== user.id;
  const answeredAttempts = attempts.filter((attempt) => attempt.selected_option !== "");
  const correctAttempts = answeredAttempts.filter((attempt) => attempt.is_correct);
  const accuracy = answeredAttempts.length
    ? Math.round((correctAttempts.length / answeredAttempts.length) * 100)
    : 0;
  const netScore = correctAttempts.length * 4 - (answeredAttempts.length - correctAttempts.length);
  const bookmarks = attempts.filter((attempt) => attempt.is_bookmarked);
  const completedQuestionIds = new Set(answeredAttempts.map((attempt) => attempt.question_id));
  const bookmarkedQuestions = bookmarks.flatMap((attempt) => {
    const match = questionLookup.get(attempt.question_id);
    return match ? [{ ...match, attempt }] : [];
  });

  const stats = [
    {
      label: "Total Attempts",
      value: isLoadingAttempts ? "..." : String(answeredAttempts.length),
      icon: Activity,
      color: "text-sky-300 bg-sky-400/10",
    },
    {
      label: "Accuracy Rate",
      value: isLoadingAttempts ? "..." : `${accuracy}%`,
      icon: Target,
      color: "text-emerald-300 bg-emerald-400/10",
    },
    {
      label: "Net Score",
      value: isLoadingAttempts ? "..." : `${netScore > 0 ? "+" : ""}${netScore}`,
      icon: Trophy,
      color: "text-amber-300 bg-amber-400/10",
    },
    {
      label: "Total Bookmarks",
      value: isLoadingAttempts ? "..." : String(bookmarks.length),
      icon: Bookmark,
      color: "text-rose-300 bg-rose-400/10",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-72px)] flex-1 bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-emerald-400">Student dashboard</p>
            <h1 className="text-3xl font-bold text-white">Your progress</h1>
            <p className="mt-2 text-sm text-slate-400">Signed in as {user.email}</p>
          </div>
        </header>

        {loadError && (
          <p role="alert" className="mb-6 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {loadError}
          </p>
        )}

        <section aria-label="Performance summary" className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400 sm:text-sm">{stat.label}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${stat.color}`}>
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-white sm:text-3xl" aria-live="polite">{stat.value}</p>
              </article>
            );
          })}
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <section aria-labelledby="bookmarks-heading">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="bookmarks-heading" className="text-lg font-bold text-white">Bookmarked questions</h2>
              <span className="text-xs text-slate-500">{isLoadingAttempts ? "Loading" : bookmarks.length}</span>
            </div>

            {isLoadingAttempts ? (
              <p className="py-6 text-sm text-slate-500" role="status">Loading saved questions...</p>
            ) : bookmarkedQuestions.length ? (
              <ul className="divide-y divide-slate-800">
                {bookmarkedQuestions.map(({ question, set }) => (
                  <li key={question.id} className="py-5 first:pt-2">
                    <Link
                      href={`/${set.exam}/${set.subject}/${set.chapter}#question-${question.id}`}
                      className="group block"
                    >
                      <div className="mb-2 flex items-center justify-between gap-4 text-xs text-slate-500">
                        <span>{set.title} · {question.year}</span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition group-hover:text-emerald-300" />
                      </div>
                      <div className="line-clamp-3 text-sm leading-6 text-slate-300 group-hover:text-white">
                        <MathRenderer content={question.question} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-3 py-6 text-sm text-slate-500">
                <CircleHelp aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Questions you bookmark while practicing will appear here.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="completion-heading">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="completion-heading" className="text-lg font-bold text-white">Chapter completion</h2>
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="space-y-5">
              {questionSets.map((set) => {
                const completedCount = set.questions.filter((question) => completedQuestionIds.has(question.id)).length;
                const completionPercent = set.questions.length
                  ? Math.round((completedCount / set.questions.length) * 100)
                  : 0;

                return (
                  <article key={`${set.exam}/${set.subject}/${set.chapter}`}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">{set.title}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{set.exam.toUpperCase()} · {set.subject}</p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-slate-400">
                        {isLoadingAttempts ? "..." : `${completedCount}/${set.questions.length}`}
                      </span>
                    </div>
                    <div
                      aria-label={`${set.title} completion`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={isLoadingAttempts ? 0 : completionPercent}
                      className="h-2 overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                    >
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
                        style={{ width: `${isLoadingAttempts ? 0 : completionPercent}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}