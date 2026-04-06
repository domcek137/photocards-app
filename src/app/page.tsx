import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Photocards MVP
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Flip image cards into text answers for fast visual learning.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Runs on Windows and macOS in any modern browser. This starter includes
          multiple sets, filtering, and a study mode with image-front and
          text-back cards.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sets"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Browse sets
          </Link>
        </div>
      </section>
    </main>
  );
}
