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
  const [batchMode, setBatchMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdSetId, setCreatedSetId] = useState<string | null>(null);

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

      setCreatedSetId(newSetId);
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Create Set</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Creates a new flashcard set with a unique ID. Add name and description to get started.
      </p>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Set title"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tags</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="comma,separated,tags"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(event) => setBatchMode(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Batch option: go to batch import screen after creating set
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {isSubmitting ? "Creating..." : "Create set"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      )}
    </section>
  );
}
