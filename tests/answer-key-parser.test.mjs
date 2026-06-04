import test from "node:test";
import assert from "node:assert/strict";

import {
  parseBulkAnswerKey,
  parseBulkSolutions,
} from "../lib/answer-key-parser.ts";

test("parses mixed letter and numeric bulk answer keys", () => {
  const parsed = parseBulkAnswerKey(
    "1-a, 2) b, 3 c, 4: 4, 5. A 6-d",
    6,
  );

  assert.deepEqual(parsed.answersByQuestion, {
    1: "a",
    2: "b",
    3: "c",
    4: "d",
    5: "a",
    6: "d",
  });
  assert.equal(parsed.parsedCount, 6);
});

test("tracks duplicates and out-of-range entries", () => {
  const parsed = parseBulkAnswerKey("1-a 1-c 2-b 99-d", 10);

  assert.deepEqual(parsed.answersByQuestion, {
    1: "c",
    2: "b",
  });
  assert.deepEqual(parsed.duplicateQuestionNumbers, [1]);
  assert.deepEqual(parsed.outOfRangeQuestionNumbers, [99]);
});

test("parses bulk solutions with answers and explanations by question number", () => {
  const parsed = parseBulkSolutions(
    "Q.1) Ans) c Exp) Option c is correct because FRP is legally enforceable. Q.2) Ans) b Exp) RBI manages liquidity through repo operations.",
    5,
  );

  assert.deepEqual(parsed.solutionsByQuestion, {
    1: {
      answer: "c",
      explanation: "Option c is correct because FRP is legally enforceable.",
    },
    2: {
      answer: "b",
      explanation: "RBI manages liquidity through repo operations.",
    },
  });
});

test("parses numbered bulk solutions when blocks start with 1.", () => {
  const parsed = parseBulkSolutions(
    "1. Ans) c Exp) First explanation. 2. Ans) b Exp) Second explanation.",
    5,
  );

  assert.deepEqual(parsed.solutionsByQuestion, {
    1: {
      answer: "c",
      explanation: "First explanation.",
    },
    2: {
      answer: "b",
      explanation: "Second explanation.",
    },
  });
});
