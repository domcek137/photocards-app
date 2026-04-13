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
      <div className="space-y-6 animate-fadeInUp">
        {/* Completion screen */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-xl dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="text-center mb-8">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {mode === "learn-again" ? "You're getting better!" : "Great work!"}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {mode === "learn-again"
                ? "You've reviewed all the cards you marked as \"don't know\"."
                : "You've gone through all the cards in this set."}
            </p>
          </div>

          {/* Pie chart using conic gradient */}
          <div className="mt-10 flex justify-center mb-10">
            <div className="relative flex items-center justify-center">
              <div
                className="h-40 w-40 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                style={{
                  background: `conic-gradient(#22c55e 0 ${knownShare}%, #ef4444 ${knownShare}% 100%)`,
                }}
              />
              <div className="absolute flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {roundKnownCount}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">known</p>
              </div>
            </div>
          </div>

          {/* Stats breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-50/50 p-4 text-center dark:border-green-700 dark:from-green-950/30 dark:to-green-950/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {roundKnownCount}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2">I know</p>
            </div>
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-4 text-center dark:border-red-700 dark:from-red-950/30 dark:to-red-950/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {roundUnknownCount}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">Don&apos;t know</p>
            </div>
          </div>

          {/* Percentage display */}
          {roundTaggedCount > 0 && (
            <div className="text-center py-4 px-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-2xl mb-8">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Success Rate</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                {Math.round(knownShare)}%
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetAll}
            className="flex-1 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-6 py-3 text-sm font-semibold text-white dark:from-slate-100 dark:to-slate-200 dark:hover:from-slate-200 dark:hover:to-slate-300 dark:text-slate-900 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            ↻ Reset
          </button>
          {roundUnknownCount > 0 && (
            <button
              type="button"
              onClick={startLearnAgain}
              className="flex-1 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 px-6 py-3 text-sm font-semibold text-amber-900 dark:border-amber-500 dark:from-amber-950/40 dark:to-orange-950/40 dark:hover:from-amber-950/60 dark:hover:to-orange-950/60 dark:text-amber-100 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              🔄 Learn again ({roundUnknownCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        <div className="min-w-0 flex-1">
          <FlipCard
            key={currentCard.id}
            imageUrl={currentCard.imageUrl}
            backText={currentCard.backText}
            cardNumber={index + 1}
            totalCards={order.length}
          />
        </div>

        <aside className="md:w-32">
          <div className="flex h-full flex-col rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {mode === "learn-again" ? "Learn again" : "Study progress"}
            </p>
            <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {Math.round(progress)}%
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {roundTaggedCount} / {order.length}
            </p>

            <div className="my-4 flex flex-1 items-end justify-center pb-2">
              <div
                className="relative h-full min-h-32 w-4 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-700"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={order.length}
                aria-valuenow={roundTaggedCount}
                aria-label="Study progress"
              >
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-cyan-500 via-blue-500 to-cyan-400 transition-all duration-500 ease-out"
                  style={{ height: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="rounded-lg border border-green-200 bg-green-50 px-2 py-1.5 text-xs font-semibold text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300">
                Know: {roundKnownCount}
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
                Don&apos;t: {roundUnknownCount}
              </div>
              {mode === "all" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                  Untagged: {order.length - roundTaggedCount}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Know / Don't know buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => markUnknown(currentCard.id)}
          className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
            currentCardUnknown
              ? "border-red-500 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              : "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
          }`}
        >
          ✗ Don&apos;t know
        </button>
        <button
          type="button"
          onClick={() => markKnown(currentCard.id)}
          className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
            currentCardKnown
              ? "border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950/30"
          }`}
        >
          ✓ I know
        </button>
      </div>
    </div>
  );
}
