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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Cards</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Page {page} of {totalPages}
        </p>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Click a card to edit its text or replace the photo.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => openEditor(card)}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            aria-label={`Edit ${card.backText}`}
          >
            <div className="relative h-40 w-full">
              <Image
                src={card.imageUrl}
                alt={card.backText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-left text-sm font-medium text-slate-900 dark:text-slate-100">
                {card.backText}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
        >
          Next
        </button>
      </div>

      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Edit card
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Update the card name or swap the image.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={onEditSubmit}>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
                <input
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setDraftImage(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Current image</p>
                  <div className="relative h-44 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
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
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">New image preview</p>
                  <div className="flex h-44 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-950">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Selected preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <p className="px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        Choose a new file to preview it here.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {message && (
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onDeleteCard}
                  disabled={isSaving || isDeleting}
                  className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-200"
                >
                  {isDeleting ? "Deleting..." : "Delete card"}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isDeleting}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
