"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Flashcard } from "@/lib/types";

type CardGalleryProps = {
  setId: string;
  cards: Flashcard[];
};

const PAGE_SIZE = 24;

export default function CardGallery({ setId, cards }: CardGalleryProps) {
  const [page, setPage] = useState(1);
  const [galleryCards, setGalleryCards] = useState(cards);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftImage, setDraftImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(galleryCards.length / PAGE_SIZE));

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setGalleryCards(cards);
  }, [cards]);

  useEffect(() => {
    if (!draftImage) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(draftImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [draftImage]);

  const visibleCards = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return galleryCards.slice(start, start + PAGE_SIZE);
  }, [galleryCards, page]);

  const openEditor = (card: Flashcard) => {
    setEditingCard(card);
    setDraftText(card.backText);
    setDraftImage(null);
    setMessage(null);
  };

  const closeEditor = () => {
    setEditingCard(null);
    setDraftImage(null);
    setImagePreview(null);
    setMessage(null);
    setIsSaving(false);
    setIsDeleting(false);
  };

  const onDeleteCard = async () => {
    if (!editingCard) {
      return;
    }

    const confirmed = window.confirm("Delete this card? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/sets/${encodeURIComponent(setId)}/cards/${encodeURIComponent(editingCard.id)}`,
        {
          method: "DELETE",
        },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete card.");
      }

      setGalleryCards((currentCards) =>
        currentCards.filter((card) => card.id !== editingCard.id),
      );

      closeEditor();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to delete card.";
      setMessage(text);
      setIsDeleting(false);
    }
  };

  const onEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingCard) {
      return;
    }

    if (!draftText.trim()) {
      setMessage("Card text is required.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("text", draftText);

      if (draftImage) {
        formData.set("image", draftImage);
      }

      const response = await fetch(
        `/api/sets/${encodeURIComponent(setId)}/cards/${encodeURIComponent(editingCard.id)}`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      const payload = (await response.json()) as { error?: string; card?: Flashcard };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update card.");
      }

      if (payload.card) {
        setGalleryCards((currentCards) =>
          currentCards.map((card) =>
            card.id === payload.card?.id ? (payload.card as Flashcard) : card,
          ),
        );
      }

      closeEditor();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to update card.";
      setMessage(text);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📸</span>
          Cards Gallery
        </h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 px-4 py-2 rounded-full">
          Page {page} of {totalPages}
        </p>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Click a card to edit or replace its photo.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            onClick={() => openEditor(card)}
            className="group overflow-hidden rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 transition-all duration-300 hover:border-cyan-400 hover:shadow-lg transform hover:-translate-y-1 dark:hover:border-cyan-400 animate-fadeInUp"
            style={{ animationDelay: `${index * 30}ms` }}
            aria-label={`Edit ${card.backText}`}
          >
            <div className="relative h-40 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <Image
                src={card.imageUrl}
                alt={card.backText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <p className="text-left text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                {card.backText}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={page === 1}
          className="rounded-lg border-2 border-slate-300 hover:border-slate-400 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          disabled={page === totalPages}
          className="rounded-lg border-2 border-slate-300 hover:border-slate-400 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Next →
        </button>
      </div>

      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 animate-scaleIn">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>✏️</span>
                  Edit Card
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Update the card text or replace the image.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border-2 border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form className="grid gap-5" onSubmit={onEditSubmit}>
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span>📝</span>
                  Card Text
                </span>
                <input
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-300 transition-all duration-300 focus:ring-2 focus:border-cyan-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span>🖼️</span>
                  Replace Photo
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setDraftImage(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 transition-all duration-300 focus:border-cyan-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Current Image</p>
                  <div className="relative h-48 overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md">
                    <Image
                      src={editingCard.imageUrl}
                      alt={editingCard.backText}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Preview</p>
                  <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 dark:border-cyan-700 dark:from-cyan-950/30 dark:to-blue-950/30 shadow-inner">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Selected preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <p className="px-4 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Select a new image to preview
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {message && (
                <div className={`rounded-xl border-2 p-4 text-sm font-medium animate-slideInRight ${
                  message.includes("error") || message.includes("Failed")
                    ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
                    : "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200"
                }`}>
                  {message}
                </div>
              )}

              <div className="flex items-center gap-3 border-t-2 border-slate-200 pt-4 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                >
                  {isSaving ? "💾 Saving..." : "✓ Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onDeleteCard}
                  disabled={isSaving || isDeleting}
                  className="ml-auto rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition-all duration-200 hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
