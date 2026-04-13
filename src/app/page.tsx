import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16">
      <section className="animate-fadeInUp">
        <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-12 shadow-xl dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <span>⚡</span>
              Photocards MVP
            </p>
            <h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent leading-tight">
              Visual learning made fast and fluid.
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Create beautiful flashcard sets with images on the front and text answers on the back. Study with smooth animations, track your progress, and review cards you find challenging.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/sets"
                className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-8 py-4 text-base font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>📚</span>
                Browse Sets
              </Link>
              <Link
                href="/sets"
                className="rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 px-8 py-4 text-base font-bold text-cyan-900 dark:border-cyan-500 dark:from-cyan-950/40 dark:to-blue-950/40 dark:hover:from-cyan-950/60 dark:hover:to-blue-950/60 dark:text-cyan-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>✨</span>
                Get Started
              </Link>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid gap-5 grid-cols-1 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 dark:border-cyan-700 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Image-First Learning</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Study with visual cues on card fronts, text answers on the back.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Smooth & Fluid</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Enjoy polished animations and transitions throughout your study sessions.</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30 p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Track Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">See your success rate with visual pie charts and progress indicators.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
