"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AddCardFormProps = {
  setId: string;
};

export default function AddCardForm({ setId }: AddCardFormProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!imageFile) {
      setMessage("Please choose an image.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("text", text);
      formData.set("image", imageFile);

      const response = await fetch(`/api/sets/${encodeURIComponent(setId)}/cards`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to add card.");
      }

      setText("");
      setImageFile(null);
      setMessage("Card added.");
      router.refresh();
    } catch (error) {
      const textValue = error instanceof Error ? error.message : "Failed to add card.";
      setMessage(textValue);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add Card</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        This saves image as sets/{setId}/photos/&lt;n&gt;.&lt;ext&gt; and text as sets/{setId}/texts/&lt;n&gt;.txt.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Image</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Back text</span>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Text shown on the back of the card"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {isSubmitting ? "Saving..." : "Add card"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      )}
    </section>
  );
}
