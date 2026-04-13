"use client";

import { useState, useCallback } from "react";
import type { Flashcard } from "@/lib/types";
import FlipCard from "@/components/study/FlipCard";

type StudyMode = "all" | "learn-again";

type StudySessionProps = {
  cards: Flashcard[];
};

export default function StudySession({ cards }: StudySessionProps) {
  const [order, setOrder] = useState<Flashcard[]>(() => [...cards]);
  const [index, setIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(() => new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(() => new Set());
  const [mode, setMode] = useState<StudyMode>("all");

  const totalCards = order.length;
  const progress = totalCards > 0 ? ((index + 1) / totalCards) * 100 : 0;

  const knownCount = knownIds.size;
  const unknownCount = unknownIds.size;
  const taggedCount = knownCount + unknownCount;

  const markKnown = useCallback(
    (cardId: string) => {
      setKnownIds((prev) => {
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });
      setUnknownIds((prev) => {
        if (!prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      setIndex((value) => Math.min(totalCards - 1, value + 1));
    },
    [totalCards],
  );

  const markUnknown = useCallback(
    (cardId: string) => {
      setUnknownIds((prev) => {
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });
      setKnownIds((prev) => {
        if (!prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      setIndex((value) => Math.min(totalCards - 1, value + 1));
    },
    [totalCards],
  );

  const shuffleArray = (arr: Flashcard[]): Flashcard[] => {
    const shuffled = [...arr];
    for (let position = shuffled.length - 1; position > 0; position -= 1) {
      const swapIndex = Math.floor(Math.random() * (position + 1));
      [shuffled[position], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[position]];
    }
    return shuffled;
  };

  const shuffleCards = () => {
    if (mode === "learn-again") {
      const unknownCards = cards.filter((card) => unknownIds.has(card.id));
      setOrder(shuffleArray(unknownCards));
    } else {
      setOrder(shuffleArray([...cards]));
    }
    setIndex(0);
  };

  const resetAll = () => {
    setOrder([...cards]);
    setIndex(0);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setMode("all");
  };

  const startLearnAgain = () => {
    const unknownCards = cards.filter((card) => unknownIds.has(card.id));
    if (unknownCards.length === 0) return;
    setOrder(unknownCards);
    setIndex(0);
    setMode("learn-again");
  };

  const currentCard = order[index];

  if (!currentCard) {
    if (mode === "learn-again") {
      return (
        <div className="space-y-4">
          <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200">
            No cards marked as &quot;don&apos;t know&quot;. Great job!
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Reset &amp; start over
          </button>
        </div>
      );
    }

    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        This set has no cards yet.
      </p>
    );
  }

  const currentCardKnown = knownIds.has(currentCard.id);
  const currentCardUnknown = unknownIds.has(currentCard.id);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {mode === "learn-again" ? "Learn again" : "Study progress"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Card {index + 1} of {totalCards}
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {Math.round(progress)}%
          </p>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalCards}
          aria-valuenow={index + 1}
          aria-label="Study progress"
        >
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Know / Don't know stats */}
        {taggedCount > 0 && (
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              I know: {knownCount}
            </span>
            <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Don&apos;t know: {unknownCount}
            </span>
            {mode === "all" && (
              <span className="text-slate-500 dark:text-slate-400">
                Untagged: {cards.length - taggedCount}
              </span>
            )}
          </div>
        )}
      </div>

      <FlipCard
        key={currentCard.id}
        imageUrl={currentCard.imageUrl}
        backText={currentCard.backText}
        cardNumber={index + 1}
        totalCards={totalCards}
      />

      {/* Know / Don't know buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => markUnknown(currentCard.id)}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            currentCardUnknown
              ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300"
              : "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
          }`}
        >
          ✗ Don&apos;t know
        </button>
        <button
          type="button"
          onClick={() => markKnown(currentCard.id)}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            currentCardKnown
              ? "border-green-500 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-950/30 dark:text-green-300"
              : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950/30"
          }`}
        >
          ✓ I know
        </button>
      </div>

      {/* Navigation & actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
        >
          Previous card
        </button>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.min(totalCards - 1, value + 1))}
          disabled={index === totalCards - 1}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          Next card
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={shuffleCards}
          className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-200 dark:hover:bg-cyan-950/30"
        >
          Shuffle cards
        </button>
        {unknownCount > 0 && mode === "all" && (
          <button
            type="button"
            onClick={startLearnAgain}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
          >
            Learn again ({unknownCount})
          </button>
        )}
      </div>
    </div>
  );
}
