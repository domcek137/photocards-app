export type Flashcard = {
  id: string;
  imageUrl: string;
  backText: string;
};

export type FlashcardSet = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  cards: Flashcard[];
};
