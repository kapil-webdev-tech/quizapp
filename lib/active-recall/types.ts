export type GenerationMode = "ai" | "manual";

export type RecallCard = {
  id: string;
  question: string;
  answer: string;
};

export type RecallSheet = {
  topic: string;
  questions: RecallCard[];
};
