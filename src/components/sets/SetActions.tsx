"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SetActionsProps = {
  setId: string;
};

export default function SetActions({ setId }: SetActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onDeleteSet}
        disabled={isDeleting}
        className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-200"
      >
        {isDeleting ? "Deleting..." : "Delete set"}
      </button>

      {message && (
        <p className="w-full text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      )}
    </div>
  );
}
