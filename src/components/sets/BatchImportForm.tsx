"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type BatchImportFormProps = {
  setId: string;
};

const readTextFile = async (file: File): Promise<string> => {
  return file.text();
};

const countNonEmptyLines = (value: string): number => {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
};

export default function BatchImportForm({ setId }: BatchImportFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"txt-file" | "from-filename">("txt-file");
  const [photos, setPhotos] = useState<File[]>([]);
  const [textFile, setTextFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (photos.length === 0) {
      setMessage("Select at least one photo.");
      return;
    }

    if (method === "txt-file") {
      if (!textFile) {
        setMessage("Select a .txt file.");
        return;
      }

      const textContent = await readTextFile(textFile);
      const lineCount = countNonEmptyLines(textContent);

      if (lineCount !== photos.length) {
        setMessage(
          `Line count and photo count must match. Photos: ${photos.length}, lines: ${lineCount}.`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("method", method);
      for (const photo of photos) {
        formData.append("photos", photo);
      }

      if (method === "txt-file" && textFile) {
        formData.set("textsFile", textFile);
      }

      const response = await fetch(`/api/sets/${encodeURIComponent(setId)}/batch`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string; importedCount?: number };
      if (!response.ok) {
        throw new Error(payload.error || "Batch import failed.");
      }

      setMessage(`Imported ${payload.importedCount || 0} cards successfully.`);
      router.push(`/sets/${encodeURIComponent(setId)}`);
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Batch import failed.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Batch Import</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Pick multiple photos and one .txt file. Each non-empty line maps to one photo.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Text source
          </legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              checked={method === "txt-file"}
              onChange={() => setMethod("txt-file")}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              Use .txt file (one non-empty line per photo)
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              checked={method === "from-filename"}
              onChange={() => setMethod("from-filename")}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              Use photo filename as text (flower1.jpg -&gt; flower1)
            </span>
          </label>
        </fieldset>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Photos</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
            onChange={(event) => setPhotos(Array.from(event.target.files || []))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          />
        </label>

        {method === "txt-file" && (
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Text file</span>
            <input
              type="file"
              accept=".txt,text/plain"
              required
              onChange={(event) => setTextFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {isSubmitting ? "Importing..." : "Start batch import"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      )}
    </section>
  );
}
