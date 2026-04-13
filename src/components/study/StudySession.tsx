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
  const [roundKnownIds, setRoundKnownIds] = useState<Set<string>>(() => new Set());
  const [roundUnknownIds, setRoundUnknownIds] = useState<Set<string>>(() => new Set());
  const [mode, setMode] = useState<StudyMode>("all");
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const totalCards = order.length;
  const globalUnknownCount = unknownIds.size;

  const roundKnownCount = roundKnownIds.size;
  const roundUnknownCount = roundUnknownIds.size;
  const roundTaggedCount = roundKnownCount + roundUnknownCount;

  const progress = totalCards > 0 ? (roundTaggedCount / totalCards) * 100 : 0;
  const knownShare = roundTaggedCount > 0 ? (roundKnownCount / roundTaggedCount) * 100 : 0;

  const resetRoundTracking = () => {
    setRoundKnownIds(new Set());
    setRoundUnknownIds(new Set());
    setIsRoundComplete(false);
  };

  const advanceOrComplete = useCallback(() => {
    setIndex((prev) => {
      const atLast = prev >= totalCards - 1;
      if (atLast) {
        setIsRoundComplete(true);
        return prev;
      }
      return prev + 1;
    });
  }, [totalCards]);

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

      setRoundKnownIds((prev) => {
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });

      setRoundUnknownIds((prev) => {
        if (!prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });

      advanceOrComplete();
    },
    [advanceOrComplete],
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

      setRoundUnknownIds((prev) => {
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });

      setRoundKnownIds((prev) => {
        if (!prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });

      advanceOrComplete();
    },
    [advanceOrComplete],
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
    resetRoundTracking();
  };

  const startLearnAgain = () => {
    const unknownCards = cards.filter((card) => unknownIds.has(card.id));
    if (unknownCards.length === 0) return;
    setOrder(unknownCards);
    setIndex(0);
    setMode("learn-again");
    resetRoundTracking();
  };

  const currentCard = order[index];

  if (!currentCard) {
    if (mode === "learn-again") {
      return (
        <div className="space-y-4">
          <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200">
            {"No cards marked as \"don't know\". Great job!"}
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

  if (isRoundComplete) {
    return (
      <div className="space-y-4">
        {/* Completion screen */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {mode === "learn-again" ? "Learn again complete!" : "Round complete!"}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {mode === "learn-again"
                ? "You've reviewed all the cards you marked as \"don't know\"."
                : "You've gone through all the cards in this set."}
            </p>
          </div>

          {/* Pie chart using conic gradient */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div
                className="h-32 w-32 rounded-full"
                style={{
                  background: `conic-gradient(#22c55e 0 ${knownShare}%, #ef4444 ${knownShare}% 100%)`,
                }}
              />
              <div className="absolute flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {roundKnownCount}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">known</p>
              </div>
            </div>
          </div>

          {/* Stats breakdown */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-700 dark:bg-green-950/30">
              <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                {roundKnownCount}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">I know</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-700 dark:bg-red-950/30">
              <p className="text-xl font-semibold text-red-700 dark:text-red-300">
                {roundUnknownCount}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Don&apos;t know</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetAll}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Reset
          </button>
          {roundUnknownCount > 0 && (
            <button
              type="button"
              onClick={startLearnAgain}
              className="flex-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
            >
              Learn again ({roundUnknownCount})
            </button>
          )}
        </div>
      </div>
    );
  }

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
              Card {index + 1} of {order.length}
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
          aria-valuemax={order.length}
          aria-valuenow={index + 1}
          aria-label="Study progress"
        >
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Know / Don't know stats */}
        {roundTaggedCount > 0 && (
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              I know: {roundKnownCount}
            </span>
            <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Don&apos;t know: {roundUnknownCount}
            </span>
            {mode === "all" && (
              <span className="text-slate-500 dark:text-slate-400">
                Untagged: {order.length - roundTaggedCount}
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
        totalCards={order.length}
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
    </div>
  );
}
