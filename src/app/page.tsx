import Link from 'next/link';
import { BookOpen, Atom, Compass, ArrowRight } from 'lucide-react';

const exams = [
  {
    id: 'jee-main',
    name: 'JEE Main',
    badge: 'Engineering',
    description: 'Chapter-wise previous year questions with step-by-step mathematical derivations.',
    subjects: [
      {
        name: 'Physics',
        slug: 'physics',
        icon: Atom,
        chapters: [
          { name: 'Kinematics', slug: 'kinematics', count: 2 },
          { name: 'Laws of Motion', slug: 'laws-of-motion', count: 'Coming soon' },
        ],
      },
    ],
  },
  {
    id: 'neet',
    name: 'NEET UG',
    badge: 'Medical',
    description: 'High-yield NCERT-focused previous year questions and detailed solutions.',
    subjects: [
      {
        name: 'Physics',
        slug: 'physics',
        icon: Compass,
        chapters: [
          { name: 'Units and Measurements', slug: 'units-and-measurements', count: 'Coming soon' },
        ],
      },
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 mb-4">
            100% Free & Open PYQ Bank
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Master Competitive Exams
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Solve chapter-wise Previous Year Questions with instant verification and formatted step-by-step solutions.
          </p>
        </header>

        {/* Exam Cards */}
        <div className="space-y-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              id={exam.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">{exam.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {exam.badge}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">{exam.description}</p>

              <div className="space-y-4">
                {exam.subjects.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <div key={sub.slug} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-sm">
                        <Icon className="w-4 h-4" />
                        <span>{sub.name}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {sub.chapters.map((chap) => {
                          const isClickable = typeof chap.count === 'number';
                          return isClickable ? (
                            <Link
                              key={chap.slug}
                              href={`/${exam.id}/${sub.slug}/${chap.slug}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition group"
                            >
                              <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-300">
                                {chap.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-emerald-400">
                                <span>{chap.count} PYQs</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </Link>
                          ) : (
                            <div
                              key={chap.slug}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800/40 text-slate-500 text-sm"
                            >
                              <span>{chap.name}</span>
                              <span className="text-xs">{chap.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}