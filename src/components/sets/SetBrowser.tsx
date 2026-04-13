"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FlashcardSet } from "@/lib/types";

type SetBrowserProps = {
  sets: FlashcardSet[];
  tags: string[];
};

export default function SetBrowser({ sets, tags }: SetBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");

  const filteredSets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sets.filter((setItem) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        setItem.name.toLowerCase().includes(normalizedQuery) ||
        setItem.description.toLowerCase().includes(normalizedQuery);
      const matchesTag =
        activeTag === "all" || setItem.tags.includes(activeTag);

      return matchesQuery && matchesTag;
    });
  }, [activeTag, query, sets]);

  return (
    <section className="space-y-8">
      <div className="grid gap-4 rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 md:grid-cols-2 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 shadow-lg">
        <label className="space-y-2 group">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span className="text-lg">🔍</span>
            Search sets
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type set name or description"
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
          />
        </label>

        <label className="space-y-2 group">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            Filter by tag
          </span>
          <select
            value={activeTag}
            onChange={(event) => setActiveTag(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="all">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSets.map((setItem, index) => (
          <article
            key={setItem.id}
            className="group rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-cyan-400 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:hover:border-cyan-400 transform hover:-translate-y-1 animate-fadeInUp"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {setItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-1 text-xs font-bold text-cyan-800 dark:from-cyan-900/40 dark:to-blue-900/40 dark:text-cyan-300 transition-transform duration-300 group-hover:scale-110"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent dark:group-hover:from-cyan-400 dark:group-hover:to-blue-400 transition-all duration-300">{setItem.name}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{setItem.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <span>📇</span>
                {setItem.cards.length} cards
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <Link
                href={`/sets/${setItem.id}`}
                className="flex-1 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-4 py-2 text-sm font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 dark:from-slate-100 dark:to-slate-200 dark:hover:from-slate-200 dark:hover:to-slate-300 dark:text-slate-900 shadow-md"
              >
                Open
              </Link>
              <Link
                href={`/study/${setItem.id}`}
                className="flex-1 rounded-lg border-2 border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 px-4 py-2 text-sm font-bold text-cyan-800 transition-all duration-200 transform hover:scale-105 active:scale-95 dark:border-cyan-500 dark:from-cyan-950/40 dark:to-blue-950/40 dark:hover:from-cyan-950/60 dark:hover:to-blue-950/60 dark:text-cyan-300 shadow-md"
              >
                Study
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredSets.length === 0 && (
        <p className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-sm font-medium text-amber-800 dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30 dark:text-amber-200 text-center">
          No sets matched your filters.
        </p>
      )}
    </section>
  );
}
