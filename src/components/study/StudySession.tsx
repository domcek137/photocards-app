"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";
import FlipCard from "@/components/study/FlipCard";

type StudySessionProps = {
  cards: Flashcard[];
};

export default function StudySession({ cards }: StudySessionProps) {
  const [order, setOrder] = useState<Flashcard[]>(() => [...cards]);
  const [index, setIndex] = useState(0);
  const totalCards = order.length;
  const progress = totalCards > 0 ? ((index + 1) / totalCards) * 100 : 0;

  const shuffleCards = () => {
    const nextOrder = [...cards];

    for (let position = nextOrder.length - 1; position > 0; position -= 1) {
      const swapIndex = Math.floor(Math.random() * (position + 1));
      [nextOrder[position], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[position]];
    }

    setOrder(nextOrder);
    setIndex(0);
  };

  const resetOrder = () => {
    setOrder([...cards]);
    setIndex(0);
  };

  const currentCard = order[index];

  if (!currentCard) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        This set has no cards yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Study progress</p>
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
      </div>

      <FlipCard
        key={currentCard.id}
        imageUrl={currentCard.imageUrl}
        backText={currentCard.backText}
        cardNumber={index + 1}
        totalCards={totalCards}
      />

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
          onClick={resetOrder}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
        >
          Reset to first
        </button>
        <button
          type="button"
          onClick={shuffleCards}
          className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-200 dark:hover:bg-cyan-950/30"
        >
          Shuffle cards
        </button>
      </div>
    </div>
  );
}
