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
    <section className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 animate-fadeInUp">
      <div className="flex items-start gap-4">
        <div className="text-4xl">📸</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Card</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Add an image and text to create a new flashcard. Files are automatically saved.
          </p>
        </div>
      </div>

      <form className="mt-6 grid gap-5" onSubmit={onSubmit}>
        <label className="space-y-2 group">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span>🖼️</span>
            Card Image
          </span>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              required
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="rounded-xl border-3 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center transition-all duration-300 group-hover:border-cyan-400 group-hover:bg-cyan-50 dark:border-slate-600 dark:from-slate-950/50 dark:to-slate-900/50 dark:group-hover:border-cyan-400 dark:group-hover:bg-slate-800">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {imageFile ? imageFile.name : "Drop image or click to select"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                JPG, PNG, WebP, or GIF
              </p>
            </div>
          </div>
        </label>

        <label className="space-y-2 group">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span>✏️</span>
            Back Text
          </span>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What should appear on the back of the card?"
            required
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 shadow-sm focus:shadow-md"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-6 py-3 text-sm font-bold text-white dark:from-slate-100 dark:to-slate-200 dark:hover:from-slate-200 dark:hover:to-slate-300 dark:text-slate-900 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? "💾 Saving..." : "➕ Add card"}
        </button>
      </form>

      {message && (
        <div className={`mt-6 rounded-xl border-2 p-4 text-sm font-medium transition-all duration-300 animate-slideInRight ${
          message.includes("error") || message.includes("Failed")
            ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
            : "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200"
        }`}>
          {message}
        </div>
      )}
    </section>
  );
}
