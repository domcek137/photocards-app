"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SetRenameButtonProps = {
  setId: string;
  initialName: string;
};

export default function SetRenameButton({ setId, initialName }: SetRenameButtonProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [isRenaming, setIsRenaming] = useState(false);

  const onRenameSet = async () => {
    const proposedName = window.prompt("Enter a new set name.", name);
    if (proposedName === null) {
      return;
    }

    const trimmedName = proposedName.trim();
    if (!trimmedName) {
      window.alert("Set name is required.");
      return;
    }

    setIsRenaming(true);

    try {
      const response = await fetch(`/api/sets/${encodeURIComponent(setId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to rename set.");
      }

      setName(trimmedName);
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to rename set.";
      window.alert(text);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onRenameSet}
      disabled={isRenaming}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300 text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
      aria-label="Rename set"
      title="Rename set"
    >
      {isRenaming ? "…" : "✏"}
    </button>
  );
}