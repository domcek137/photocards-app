"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const splitTags = (tagsValue: string): string[] => {
  return tagsValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export default function SetCreator() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          tags: splitTags(tags),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        set?: { id: string };
      };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create set.");
      }

      const newSetId = payload.set?.id;
      if (!newSetId) {
        throw new Error("No set ID returned from server.");
      }

      setMessage(`Set created successfully! ID: ${newSetId}`);
      setName("");
      setDescription("");
      setTags("");
      
      setTimeout(() => {
        if (batchMode) {
          router.push(`/sets/${encodeURIComponent(newSetId)}/batch-import`);
        } else {
          router.push(`/sets/${encodeURIComponent(newSetId)}`);
        }
      }, 500);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to create set.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="animate-fadeInUp">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-4 text-left shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 dark:hover:border-slate-600"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">Create set</span>
        </span>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✨</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Set</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Create a new flashcard set with auto-generated ID. Add name and description to get started.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <label className="space-y-2 group md:col-span-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Set Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Spanish Vocabulary"
                required
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2 group md:col-span-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What's this set about?"
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2 group md:col-span-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Tags</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="language,spanish,beginner"
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Separate tags with commas</p>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-3 transition-all duration-300 hover:bg-cyan-100 dark:border-cyan-800 dark:from-cyan-950/30 dark:to-blue-950/30 dark:hover:from-cyan-950/50 dark:hover:to-blue-950/50 md:col-span-2">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={(event) => setBatchMode(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300"
              />
              <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Go to batch import after creating
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-800 hover:to-slate-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-200 dark:hover:to-slate-300 md:col-span-2"
            >
              {isSubmitting ? "🔄 Creating..." : "✨ Create set"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 animate-slideInRight rounded-xl border-2 p-4 text-sm font-medium transition-all duration-300 ${
                message.includes("error") || message.includes("Failed")
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
                  : "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
