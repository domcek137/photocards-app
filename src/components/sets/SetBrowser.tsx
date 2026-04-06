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
    <section className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2 dark:border-slate-700 dark:bg-slate-900">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Search sets</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type set name or description"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Filter by tag</span>
          <select
            value={activeTag}
            onChange={(event) => setActiveTag(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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

      <div className="grid gap-4 md:grid-cols-2">
        {filteredSets.map((setItem) => (
          <article
            key={setItem.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {setItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{setItem.name}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{setItem.description}</p>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {setItem.cards.length} cards
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/sets/${setItem.id}`}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                Open set
              </Link>
              <Link
                href={`/study/${setItem.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Study
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredSets.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No sets matched your filters.
        </p>
      )}
    </section>
  );
}
