"use client";

import Image from "next/image";
import { useState } from "react";

type FlipCardProps = {
  imageUrl: string;
  backText: string;
  cardNumber: number;
  totalCards: number;
};

export default function FlipCard({
  imageUrl,
  backText,
  cardNumber,
  totalCards,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 10);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        className="group w-full text-left"
        aria-label="Flip card"
      >
        <div className="mb-3 text-sm text-slate-600">
          Card {cardNumber} of {totalCards}
        </div>
        <div
          className="relative mx-auto w-full max-w-4xl [perspective:1200px]"
          style={{
            aspectRatio,
            maxHeight: "70vh",
          }}
        >
          <div
            className={`relative h-full w-full rounded-3xl border border-slate-300 shadow-lg transition-transform duration-500 [transform-style:preserve-3d] dark:border-slate-700 ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white [backface-visibility:hidden] dark:bg-slate-950">
              <Image
                src={imageUrl}
                alt="Flashcard front"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                loading="eager"
                onLoad={(event) => {
                  const imageElement = event.currentTarget;
                  if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
                    setAspectRatio(imageElement.naturalWidth / imageElement.naturalHeight);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                Front: image
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div>
                <div className="mb-3 text-xs uppercase tracking-wide text-slate-300">
                  Back: text
                </div>
                <p className="text-3xl font-semibold text-white">{backText}</p>
              </div>
            </div>
          </div>
        </div>
      </button>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Click card to flip. Use keyboard buttons below to navigate cards.
      </p>
    </div>
  );
}
