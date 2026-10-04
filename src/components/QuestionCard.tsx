'use client';

import { useEffect, useState } from 'react';
import MathRenderer from './MathRenderer';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, ChevronDown, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GUEST_ATTEMPTS_KEY = 'crackpyq:attempts:v1';

interface SavedAttempt {
  selected_option: string;
  is_correct: boolean;
  is_bookmarked: boolean;
}

function readGuestAttempts(): Record<string, SavedAttempt> {
  try {
    const stored = window.localStorage.getItem(GUEST_ATTEMPTS_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, SavedAttempt>)
      : {};
  } catch {
    return {};
  }
}

export interface QuestionData {
  id: string;
  exam: string;
  subject: string;
  chapter: string;
  year: number;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
}

export default function QuestionCard({ data }: { data: QuestionData }) {
  const { user, loading } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [restoredAttemptKey, setRestoredAttemptKey] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const attemptKey = `${user?.id ?? 'guest'}:${data.id}`;
  const isRestored = restoredAttemptKey === attemptKey;
  const currentSelected = isRestored ? selected : null;
  const currentBookmarked = isRestored ? bookmarked : false;

  useEffect(() => {
    if (loading) return;

    let isCurrent = true;

    const restoreAttempt = async () => {
      try {
        let attempt: SavedAttempt | null = null;

        if (user) {
          const { data: savedAttempt, error } = await supabase
            .from('user_attempts')
            .select('selected_option, is_correct, is_bookmarked')
            .eq('user_id', user.id)
            .eq('question_id', data.id)
            .maybeSingle();

          if (error) throw error;
          attempt = savedAttempt;
        } else {
          attempt = readGuestAttempts()[data.id] ?? null;
        }

        if (isCurrent) {
          setSelected(attempt?.selected_option || null);
          setBookmarked(Boolean(attempt?.is_bookmarked));
          setPersistenceError(null);
          setRestoredAttemptKey(attemptKey);
        }
      } catch {
        if (isCurrent) {
          setSelected(null);
          setBookmarked(false);
          setPersistenceError('Could not load your saved progress.');
          setRestoredAttemptKey(attemptKey);
        }
      }
    };

    void restoreAttempt();

    return () => {
      isCurrent = false;
    };
  }, [attemptKey, data.id, loading, user]);

  const saveAttempt = async (attempt: SavedAttempt) => {
    if (user) {
      const { error } = await supabase.from('user_attempts').upsert(
        {
          user_id: user.id,
          question_id: data.id,
          ...attempt,
        },
        { onConflict: 'user_id,question_id' },
      );

      if (error) throw error;
      return;
    }

    const attempts = readGuestAttempts();
    attempts[data.id] = attempt;
    window.localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify(attempts));
  };

  const handleSelect = async (optKey: string) => {
    if (currentSelected || loading || !isRestored) return;
    setSelected(optKey);
    setPersistenceError(null);

    try {
      await saveAttempt({
        selected_option: optKey,
        is_correct: optKey === data.correct_option,
        is_bookmarked: currentBookmarked,
      });
    } catch {
      setPersistenceError('Your answer could not be saved. Please try again later.');
    }
  };

  const toggleBookmark = async () => {
    if (loading || !isRestored) return;
    const nextBookmarkState = !currentBookmarked;
    setBookmarked(nextBookmarkState);
    setPersistenceError(null);

    try {
      await saveAttempt({
        selected_option: currentSelected ?? '',
        is_correct: currentSelected === data.correct_option,
        is_bookmarked: nextBookmarkState,
      });
    } catch {
      setPersistenceError('Your bookmark could not be saved. Please try again later.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
        <span className="bg-slate-800 px-2.5 py-1 rounded font-mono font-medium tracking-wide">
          {data.exam.toUpperCase()} • {data.year}
        </span>
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={loading || !isRestored}
          aria-pressed={currentBookmarked}
          className={`p-1.5 rounded-md hover:bg-slate-800 transition ${
            currentBookmarked ? 'text-amber-400' : 'text-slate-500'
          }`}
          aria-label="Bookmark Question"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {persistenceError && (
        <p role="status" className="mb-3 text-xs text-rose-300">
          {persistenceError}
        </p>
      )}

      <div className="mb-5 text-base leading-relaxed">
        <MathRenderer content={data.question} />
      </div>

      <div className="space-y-2.5">
        {Object.entries(data.options).map(([key, text]) => {
          let stateStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-200';

          if (currentSelected) {
            if (key === data.correct_option) {
              stateStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-300';
            } else if (key === currentSelected) {
              stateStyle = 'border-rose-500 bg-rose-950/20 text-rose-300';
            } else {
              stateStyle = 'opacity-40 border-slate-800 text-slate-400';
            }
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              disabled={Boolean(currentSelected) || loading || !isRestored}
              className={`w-full flex items-center p-3 rounded-lg border text-left transition duration-150 ${stateStyle}`}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 mr-3 shrink-0">
                {key}
              </span>
              <div className="flex-1">
                <MathRenderer content={text} />
              </div>
              {currentSelected && key === data.correct_option && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-2 shrink-0" />
              )}
              {currentSelected && key === currentSelected && key !== data.correct_option && (
                <XCircle className="w-5 h-5 text-rose-400 ml-2 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {currentSelected && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center text-xs font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
          >
            {showSolution ? 'Hide Detailed Solution' : 'View Detailed Solution'}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showSolution ? 'rotate-180' : ''}`} />
          </button>

          {showSolution && (
            <div className="mt-3 p-4 bg-slate-950/80 rounded-lg border border-slate-800 text-sm leading-relaxed">
              <MathRenderer content={data.explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}