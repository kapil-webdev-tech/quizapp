export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  topic: string;
  tags: string[];
};

export type QuizSet = {
  slug: string;
  title: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: string;
  attemptCount: string;
  description: string;
  focusAreas: string[];
  isPublic: boolean;
  questions: QuizQuestion[];
};
