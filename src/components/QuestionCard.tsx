'use client';

import { useState } from 'react';
import MathRenderer from './MathRenderer';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, ChevronDown, Bookmark } from 'lucide-react';

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
  const [selected, setSelected] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleSelect = async (optKey: string) => {
    if (selected) return;
    setSelected(optKey);
    const isCorrect = optKey === data.correct_option;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('user_attempts').upsert({
          user_id: userData.user.id,
          question_id: data.id,
          selected_option: optKey,
          is_correct: isCorrect,
        });
      }
    } catch {
      // Offline or placeholder environment fallback
    }
  };

  const toggleBookmark = async () => {
    const nextBookmarkState = !bookmarked;
    setBookmarked(nextBookmarkState);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('user_attempts').upsert({
          user_id: userData.user.id,
          question_id: data.id,
          selected_option: selected || '',
          is_correct: selected === data.correct_option,
          is_bookmarked: nextBookmarkState,
        });
      }
    } catch {
      // Offline or placeholder environment fallback
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
        <span className="bg-slate-800 px-2.5 py-1 rounded font-mono font-medium tracking-wide">
          {data.exam.toUpperCase()} • {data.year}
        </span>
        <button
          onClick={toggleBookmark}
          className={`p-1.5 rounded-md hover:bg-slate-800 transition ${
            bookmarked ? 'text-amber-400' : 'text-slate-500'
          }`}
          aria-label="Bookmark Question"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-5 text-base leading-relaxed">
        <MathRenderer content={data.question} />
      </div>

      <div className="space-y-2.5">
        {Object.entries(data.options).map(([key, text]) => {
          let stateStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-200';

          if (selected) {
            if (key === data.correct_option) {
              stateStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-300';
            } else if (key === selected) {
              stateStyle = 'border-rose-500 bg-rose-950/20 text-rose-300';
            } else {
              stateStyle = 'opacity-40 border-slate-800 text-slate-400';
            }
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={Boolean(selected)}
              className={`w-full flex items-center p-3 rounded-lg border text-left transition duration-150 ${stateStyle}`}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 mr-3 shrink-0">
                {key}
              </span>
              <div className="flex-1">
                <MathRenderer content={text} />
              </div>
              {selected && key === data.correct_option && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-2 shrink-0" />
              )}
              {selected && key === selected && key !== data.correct_option && (
                <XCircle className="w-5 h-5 text-rose-400 ml-2 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
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