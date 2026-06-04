import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { EditableQuiz, EditableQuestion } from "@/lib/custom-quiz-schema";

const execFileAsync = promisify(execFile);
const QUESTION_START_PATTERN = /(?:^|\n)\s*Q\.?\s*(\d{1,3})\)\s*/gim;
const NUMBERED_QUESTION_START_PATTERN = /(?:^|\n)\s*(\d{1,3})\.\s+/gm;
const OPTION_LABEL_PATTERN = /\b([a-d])\)\s*/gi;
const MAX_IMPORT_PAGES = 80;

export type UpscPdfExamType = "gs" | "csat";

export type ParsedUpscPdfQuiz = {
  quiz: EditableQuiz;
  examType: UpscPdfExamType;
  expectedQuestionCount: number;
  extractedQuestionCount: number;
  skippedPageCount: number;
  warnings: string[];
};

type LayoutPage = {
  pageNumber: number;
  text: string;
};

function trimFileExtension(fileName: string) {
  return fileName.replace(/\.[a-z0-9]+$/i, "").trim();
}

function normalizeInlineWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLayoutText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function isPdfNoiseLine(line: string) {
  const normalized = line.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return true;
  }

  return (
    /^page\s+\d+$/i.test(normalized) ||
    /^pts\s+\d{4}/i.test(normalized) ||
    /test\s*code/i.test(normalized) ||
    /forum\s*ias/i.test(normalized) ||
    /forumias/i.test(normalized) ||
    /academy\.forumias/i.test(normalized) ||
    /https?:\/\//i.test(normalized) ||
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(normalized) ||
    /(?:\+?91[-\s]?)?\d{10}/.test(normalized) ||
    /above kalyan jewellers/i.test(normalized) ||
    /boring canal road/i.test(normalized) ||
    /jawahar nagar/i.test(normalized)
  );
}

function stripPdfNoise(text: string) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !isPdfNoiseLine(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeImportedPrompt(prompt: string) {
  let cleaned = prompt
    .replace(/\bPage\s+\d+\b/gi, "")
    .replace(/\b(?:https?:\/\/\S+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, "")
    .replace(/(?:\+?91[-\s]?)?\d{10,}/g, "")
    .replace(/\s+\|+\s+/g, " ");

  const firstStatementMatch = cleaned.match(
    /(?:Statement|Stmt|कथन)\s*(?:I|II|III|IV|V|\d+)\s*:/i,
  );
  if (firstStatementMatch?.index !== undefined) {
    const intro = cleaned.slice(0, firstStatementMatch.index);
    const introHasNoise =
      /forum|plot no|floor|road|jewellers|palace|plaza|nagar|academy|admissions|helpdesk|karol bagh|boring canal/i.test(
        intro,
      );
    const considerMatch = intro.match(/^(.*?consider the following statements:\s*)/i);

    if (introHasNoise && considerMatch) {
      cleaned =
        considerMatch[1] + cleaned.slice(firstStatementMatch.index).trimStart();
    }
  }

  cleaned = cleaned.replace(
    /(?:forum learning centre|forumias|forum ias)[\s\S]*?(?=(?:Statement|Stmt|कथन)\s*(?:I|II|III|IV|V|\d+)\s*:|Which\b|$)/gi,
    "",
  );

  return normalizeInlineWhitespace(cleaned.replace(/\s{2,}/g, " "));
}

function detectExamType(source: string, fileName: string): UpscPdfExamType {
  const haystack = `${fileName}\n${source}`.toLowerCase();
  if (
    /\bcsat\b/.test(haystack) ||
    /paper\s*ii/.test(haystack) ||
    /aptitude/.test(haystack)
  ) {
    return "csat";
  }

  return "gs";
}

function expectedQuestionCountForExam(examType: UpscPdfExamType) {
  return examType === "csat" ? 80 : 100;
}

async function extractPdfLayoutPages(
  file: File,
  maxPages = MAX_IMPORT_PAGES,
  skipPages = 0,
): Promise<LayoutPage[]> {
  const tempDir = await mkdtemp(join(tmpdir(), "quizapp-upsc-import-"));
  const inputPath = join(tempDir, "input.pdf");

  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    const pages: LayoutPage[] = [];

    for (
      let pageNumber = skipPages + 1;
      pageNumber <= skipPages + maxPages;
      pageNumber += 1
    ) {
      const outputPath = join(tempDir, `page-${pageNumber}.txt`);
      try {
        await execFileAsync("pdftotext", [
          "-layout",
          "-f",
          String(pageNumber),
          "-l",
          String(pageNumber),
          "-enc",
          "UTF-8",
          inputPath,
          outputPath,
        ]);
      } catch {
        break;
      }

      const text = await readFile(outputPath, "utf8");
      if (!text.trim()) {
        continue;
      }

      pages.push({
        pageNumber,
        text: stripPdfNoise(normalizeLayoutText(text)),
      });
    }

    return pages;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function reorderTwoColumnPage(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return "";
  }

  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const midpoint = Math.max(20, Math.floor(maxLineLength / 2));
  const leftLines: string[] = [];
  const rightLines: string[] = [];

  for (const line of lines) {
    const gapMatch = line.match(/^(.*?\S)(\s{6,})(\S.*)$/);
    if (gapMatch) {
      leftLines.push(gapMatch[1].trim());
      rightLines.push(gapMatch[3].trim());
      continue;
    }

    const firstTextIndex = line.search(/\S/);
    if (firstTextIndex === -1) {
      continue;
    }

    if (/^\s*\d+\s*$/.test(line)) {
      continue;
    }

    if (firstTextIndex >= midpoint * 0.65) {
      rightLines.push(line.trim());
      continue;
    }

    leftLines.push(line.trim());
  }

  return [...leftLines, ...rightLines].join("\n");
}

export function extractSequentialQuestionBlocks(source: string, expectedCount: number) {
  const qBlocks = extractSequentialQuestionBlocksFromPattern(
    source,
    expectedCount,
    QUESTION_START_PATTERN,
    false,
  );
  if (qBlocks.length === expectedCount) {
    return qBlocks;
  }

  const numberedBlocks = extractSequentialQuestionBlocksFromPattern(
    source,
    expectedCount,
    NUMBERED_QUESTION_START_PATTERN,
    true,
  );
  if (numberedBlocks.length === expectedCount) {
    return numberedBlocks;
  }

  throw new Error(
    `Expected ${expectedCount} questions in the PDF, but extracted ${Math.max(qBlocks.length, numberedBlocks.length)}.`,
  );
}

function extractSequentialQuestionBlocksFromPattern(
  source: string,
  expectedCount: number,
  pattern: RegExp,
  normalizeNumberedPrefix: boolean,
) {
  const matches = Array.from(source.matchAll(pattern));
  const sequence: Array<{ number: number; index: number }> = [];

  for (let matchIndex = 0; matchIndex < matches.length; matchIndex += 1) {
    const match = matches[matchIndex];
    const number = Number(match[1]);
    const index = match.index ?? -1;
    if (index < 0) {
      continue;
    }

    if (sequence.length === 0) {
      if (number !== 1) {
        continue;
      }
      sequence.push({ number, index });
      continue;
    }

    const nextExpected = sequence.length + 1;
    if (number === nextExpected) {
      const nextIndex =
        matchIndex + 1 < matches.length
          ? (matches[matchIndex + 1].index ?? source.length)
          : source.length;
      const candidateText = source.slice(index, nextIndex).trim();
      const normalizedCandidate = normalizeNumberedPrefix
        ? candidateText.replace(/^(\d{1,3})\.\s+/m, "Q$1) ")
        : candidateText;

      if ((normalizedCandidate.match(OPTION_LABEL_PATTERN) ?? []).length < 4) {
        continue;
      }

      sequence.push({ number, index });
      if (sequence.length === expectedCount) {
        break;
      }
    }
  }

  return sequence.map((entry, index) => {
    const nextIndex =
      index + 1 < sequence.length ? sequence[index + 1].index : source.length;
    const text = source.slice(entry.index, nextIndex).trim();
    return {
      number: entry.number,
      text: normalizeNumberedPrefix
        ? text.replace(/^(\d{1,3})\.\s+/m, "Q$1) ")
        : text,
    };
  });
}

export function parseQuestionBlock(
  block: string,
  index: number,
  examType: UpscPdfExamType,
): EditableQuestion {
  const normalizedBlock = normalizeInlineWhitespace(
    block.replace(/^(?:Q\.?\s*\d{1,3}\)|\d{1,3}\.)\s*/i, ""),
  );
  const optionMatches = Array.from(normalizedBlock.matchAll(OPTION_LABEL_PATTERN));

  if (optionMatches.length < 4) {
    throw new Error(`Question ${index + 1}: could not detect all four options in the imported PDF.`);
  }

  const optionLabels = optionMatches.slice(0, 4).map((match) => match[1].toLowerCase());
  if (optionLabels.join(",") !== "a,b,c,d") {
    throw new Error(`Question ${index + 1}: options must appear in a), b), c), d) order.`);
  }

  const firstOptionIndex = optionMatches[0].index ?? -1;
  if (firstOptionIndex <= 0) {
    throw new Error(`Question ${index + 1}: prompt text is missing before the options.`);
  }

  const prompt = normalizedBlock.slice(0, firstOptionIndex).trim();
  const options = optionMatches.slice(0, 4).map((match, optionIndex, allMatches) => {
    const start = (match.index ?? 0) + match[0].length;
    const end =
      optionIndex + 1 < allMatches.length
        ? (allMatches[optionIndex + 1].index ?? normalizedBlock.length)
        : normalizedBlock.length;
    return normalizeInlineWhitespace(normalizedBlock.slice(start, end));
  });

  if (!prompt || options.some((option) => option.length === 0)) {
    throw new Error(`Question ${index + 1}: imported prompt or options are incomplete.`);
  }

  const cleanedPrompt = sanitizeImportedPrompt(prompt);
  if (!cleanedPrompt) {
    throw new Error(`Question ${index + 1}: prompt became empty after removing PDF header/footer noise.`);
  }

  return {
    prompt: cleanedPrompt,
    options: [options[0], options[1], options[2], options[3]],
    answer: "a",
    explanation: "Imported from PDF. Review the answer key manually.",
    difficulty: "Moderate",
    topic: examType === "csat" ? "CSAT" : "General Studies",
    tags: ["PDF Import", "UPSC Prelims", examType.toUpperCase()],
  };
}

function importUpscPdfQuizFromPreparedPages(
  fileName: string,
  pages: LayoutPage[],
  skipPages = 0,
): ParsedUpscPdfQuiz {
  if (pages.length === 0) {
    throw new Error("No readable text was extracted from the PDF.");
  }

  const normalizedPages = pages
    .map((page) => ({
      pageNumber: page.pageNumber,
      text: stripPdfNoise(normalizeLayoutText(page.text)),
    }))
    .filter((page) => page.text.trim().length > 0);

  if (normalizedPages.length === 0) {
    throw new Error("No readable text was extracted from the PDF.");
  }

  const firstPageText = normalizedPages[0]?.text ?? "";
  const examType = detectExamType(firstPageText, fileName);
  const expectedQuestionCount = expectedQuestionCountForExam(examType);

  const firstQuestionPageIndex = normalizedPages.findIndex((page) =>
    /\bQ\.?\s*1\)|(?:^|\n)\s*1\.\s+/im.test(page.text),
  );

  if (firstQuestionPageIndex === -1) {
    throw new Error("Could not find Question 1 in the attached PDF.");
  }

  const skippedPageCount = skipPages + firstQuestionPageIndex;
  const combinedSource = normalizedPages
    .slice(firstQuestionPageIndex)
    .map((page) => page.text)
    .join("\n\n");
  const questionBlocks = extractSequentialQuestionBlocks(
    combinedSource,
    expectedQuestionCount,
  );
  const questions = questionBlocks.map((block, index) =>
    parseQuestionBlock(block.text, index, examType),
  );

  const baseTitle = trimFileExtension(fileName) || "Imported UPSC Test";
  const quiz: EditableQuiz = {
    title: baseTitle,
    category: examType === "csat" ? "CSAT" : "General Studies",
    description:
      examType === "csat"
        ? "Imported from a CSAT prelims PDF. Review answers and explanations before saving."
        : "Imported from a GS prelims PDF. Review answers and explanations before saving.",
    durationMinutes: 120,
    negativeMarking: "0.66 per wrong answer",
    focusAreas:
      examType === "csat"
        ? ["UPSC Prelims", "CSAT", "PDF Import"]
        : ["UPSC Prelims", "General Studies", "PDF Import"],
    isPublic: false,
    questions,
  };

  const warnings: string[] = [
    "Imported questions use placeholder answers and explanations. Review them before saving.",
  ];
  if (skippedPageCount > 0) {
    warnings.push(
      `Skipped ${skippedPageCount} page${skippedPageCount === 1 ? "" : "s"} before Question 1.`,
    );
  }

  return {
    quiz,
    examType,
    expectedQuestionCount,
    extractedQuestionCount: questions.length,
    skippedPageCount,
    warnings,
  };
}

export async function importUpscPdfQuiz(
  file: File,
  skipPages = 0,
): Promise<ParsedUpscPdfQuiz> {
  const pages = await extractPdfLayoutPages(file, MAX_IMPORT_PAGES, skipPages);
  const reorderedPages = pages.map((page) => ({
    ...page,
    text: reorderTwoColumnPage(page.text),
  }));
  return importUpscPdfQuizFromPreparedPages(file.name, reorderedPages, skipPages);
}
