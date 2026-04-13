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
        className="group w-full text-left transition-all duration-300"
        aria-label="Flip card"
      >
        <div className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">
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
            className={`relative h-full w-full rounded-3xl border-2 border-slate-200 shadow-xl transition-all duration-500 [transform-style:preserve-3d] dark:border-slate-700 group-hover:shadow-2xl group-hover:border-cyan-400/50 dark:group-hover:border-cyan-400/50 ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 [backface-visibility:hidden] dark:from-slate-950 dark:to-slate-900">
              <Image
                src={imageUrl}
                alt="Flashcard front"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                onLoad={(event) => {
                  const imageElement = event.currentTarget;
                  if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
                    setAspectRatio(imageElement.naturalWidth / imageElement.naturalHeight);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/20" />
              <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/90 dark:text-slate-200 shadow-lg">
                Front: image
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div>
                <div className="mb-4 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  Back: text
                </div>
                <p className="text-3xl font-bold text-white leading-relaxed">{backText}</p>
              </div>
            </div>
          </div>
        </div>
      </button>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
        Click card to flip. Use buttons below to navigate cards.
      </p>
    </div>
  );
}
