import type { Flashcard, FlashcardSet } from "@/lib/types";

const createCards = (
  setId: string,
  topicLabel: string,
  count: number,
): Flashcard[] => {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;

    return {
      id: `${setId}-${number}`,
      imageUrl: `https://picsum.photos/seed/${setId}-${number}/800/520`,
      backText: `${topicLabel} ${number}`,
    };
  });
};

export const cardSets: FlashcardSet[] = [
  {
    id: "animals-basics",
    name: "Animals Basics",
    description: "Identify common animals from images.",
    tags: ["biology", "beginner"],
    cards: createCards("animals-basics", "Animal", 120),
  },
  {
    id: "geography-landmarks",
    name: "World Landmarks",
    description: "Flip the card to reveal the landmark name.",
    tags: ["geography", "visual"],
    cards: createCards("geography-landmarks", "Landmark", 100),
  },
  {
    id: "food-vocabulary",
    name: "Food Vocabulary",
    description: "Learn food words from photos.",
    tags: ["language", "practice"],
    cards: createCards("food-vocabulary", "Food item", 110),
  },
];

export const allTags = Array.from(
  new Set(cardSets.flatMap((setItem) => setItem.tags)),
).sort();

export const getSetById = (setId: string): FlashcardSet | undefined => {
  return cardSets.find((setItem) => setItem.id === setId);
};
