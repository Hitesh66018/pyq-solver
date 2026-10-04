import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ListChecks } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";
import { getChapterQuestionSet } from "@/lib/questions";

interface ChapterPageProps {
  params: Promise<{ exam: string; subject: string; chapter: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { exam, subject, chapter } = await params;
  const questionSet = getChapterQuestionSet(exam, subject, chapter);

  if (!questionSet) notFound();

  return (
    <main className="min-h-[calc(100vh-72px)] flex-1 bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/#${exam}`}
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-300"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to exam library
        </Link>

        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-emerald-400">
              {exam.replaceAll("-", " ")} / {subject}
            </p>
            <h1 className="text-3xl font-bold text-white">{questionSet.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Previous-year questions with instant feedback and worked solutions.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <ListChecks aria-hidden="true" className="h-4 w-4 text-emerald-400" />
            {questionSet.questions.length} questions
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <section aria-label="Chapter questions" className="order-2 space-y-4 lg:order-1">
            {questionSet.questions.map((question) => (
              <QuestionCard key={question.id} data={question} />
            ))}
          </section>

          <aside className="order-1 h-fit rounded-lg border border-slate-800 bg-slate-900 p-4 lg:sticky lg:top-28 lg:order-2">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">Question palette</h2>
            <nav aria-label="Question palette" className="flex flex-wrap gap-2 lg:grid lg:grid-cols-4">
              {questionSet.questions.map((question, index) => (
                <Link
                  key={question.id}
                  href={`#question-${question.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300"
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}