"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SetActionsProps = {
  setId: string;
  initialName: string;
};

export default function SetActions({ setId, initialName }: SetActionsProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Set name is required.");
      return;
    }

    setIsRenaming(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/sets/${encodeURIComponent(setId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to rename set.");
      }

      setMessage("Set renamed.");
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to rename set.";
      setMessage(text);
    } finally {
      setIsRenaming(false);
    }
  };

  const onDeleteSet = async () => {
    const confirmed = window.confirm(
      "Delete this set and all its cards? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/sets/${encodeURIComponent(setId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete set.");
      }

      router.push("/sets");
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to delete set.";
      setMessage(text);
      setIsDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Set actions</h2>

      <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={onRename}>
        <label className="min-w-72 flex-1 space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Set name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isRenaming || isDeleting}
          className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-700 dark:text-cyan-200"
        >
          {isRenaming ? "Renaming..." : "Rename set"}
        </button>

        <button
          type="button"
          onClick={onDeleteSet}
          disabled={isDeleting || isRenaming}
          className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-200"
        >
          {isDeleting ? "Deleting..." : "Delete set"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      )}
    </section>
  );
}
