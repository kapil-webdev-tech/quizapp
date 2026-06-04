export type ParsedAnswerKey = {
  answersByQuestion: Record<number, "a" | "b" | "c" | "d">;
  duplicateQuestionNumbers: number[];
  outOfRangeQuestionNumbers: number[];
  parsedCount: number;
};

export type ParsedBulkSolutions = {
  solutionsByQuestion: Record<
    number,
    {
      answer?: "a" | "b" | "c" | "d";
      explanation?: string;
    }
  >;
  duplicateQuestionNumbers: number[];
  outOfRangeQuestionNumbers: number[];
  parsedCount: number;
};

function normalizeAnswerToken(token: string) {
  const normalized = token.trim().toLowerCase();

  if (normalized === "1" || normalized === "a") {
    return "a";
  }
  if (normalized === "2" || normalized === "b") {
    return "b";
  }
  if (normalized === "3" || normalized === "c") {
    return "c";
  }
  if (normalized === "4" || normalized === "d") {
    return "d";
  }

  return null;
}

function normalizeExplanation(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function parseBulkAnswerKey(text: string, questionCount: number): ParsedAnswerKey {
  const answersByQuestion: Record<number, "a" | "b" | "c" | "d"> = {};
  const duplicateQuestionNumbers = new Set<number>();
  const outOfRangeQuestionNumbers = new Set<number>();
  const pattern =
    /(^|[\s,;|])(\d{1,3})\s*[\).:\-]?\s*(?:\(?([A-Da-d])\)?|([1-4]))(?=$|[\s,;|])/g;

  let parsedCount = 0;

  for (const match of text.matchAll(pattern)) {
    const questionNumber = Number(match[2]);
    const answerToken = match[3] ?? match[4] ?? "";
    const normalizedAnswer = normalizeAnswerToken(answerToken);

    if (!normalizedAnswer) {
      continue;
    }

    parsedCount += 1;

    if (questionNumber < 1 || questionNumber > questionCount) {
      outOfRangeQuestionNumbers.add(questionNumber);
      continue;
    }

    if (answersByQuestion[questionNumber]) {
      duplicateQuestionNumbers.add(questionNumber);
    }

    answersByQuestion[questionNumber] = normalizedAnswer;
  }

  return {
    answersByQuestion,
    duplicateQuestionNumbers: Array.from(duplicateQuestionNumbers).sort((a, b) => a - b),
    outOfRangeQuestionNumbers: Array.from(outOfRangeQuestionNumbers).sort((a, b) => a - b),
    parsedCount,
  };
}

export function parseBulkSolutions(
  text: string,
  questionCount: number,
): ParsedBulkSolutions {
  const solutionsByQuestion: Record<
    number,
    {
      answer?: "a" | "b" | "c" | "d";
      explanation?: string;
    }
  > = {};
  const duplicateQuestionNumbers = new Set<number>();
  const outOfRangeQuestionNumbers = new Set<number>();
  const normalizedText = text.replace(
    /\s+(?=(?:Q(?:uestion)?\.?\s*)?\d{1,3}[.)]\s*(?:Ans|Answer))/gi,
    "\n",
  );
  const questionPattern =
    /(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]\s*([\s\S]*?)(?=(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*)?\d{1,3}[.)]\s*|$)/gim;

  let parsedCount = 0;

  for (const match of normalizedText.matchAll(questionPattern)) {
    const questionNumber = Number(match[1]);
    const block = (match[2] ?? "").trim();
    const answerMatch = block.match(/\bAns(?:wer)?\)?\s*[:\-)]?\s*([A-Da-d1-4])\b/i);
    const explanationMatch = block.match(/\bExp(?:lanation)?\)?\s*[:\-)]?\s*([\s\S]*)$/i);
    const answer = answerMatch ? normalizeAnswerToken(answerMatch[1]) : null;
    const explanation = explanationMatch
      ? normalizeExplanation(explanationMatch[1])
      : "";

    if (!answer && !explanation) {
      continue;
    }

    parsedCount += 1;

    if (questionNumber < 1 || questionNumber > questionCount) {
      outOfRangeQuestionNumbers.add(questionNumber);
      continue;
    }

    if (solutionsByQuestion[questionNumber]) {
      duplicateQuestionNumbers.add(questionNumber);
    }

    solutionsByQuestion[questionNumber] = {
      ...(answer ? { answer } : {}),
      ...(explanation ? { explanation } : {}),
    };
  }

  return {
    solutionsByQuestion,
    duplicateQuestionNumbers: Array.from(duplicateQuestionNumbers).sort((a, b) => a - b),
    outOfRangeQuestionNumbers: Array.from(outOfRangeQuestionNumbers).sort((a, b) => a - b),
    parsedCount,
  };
}
