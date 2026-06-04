import test from "node:test";
import assert from "node:assert/strict";

import {
  formatQuestionPrompt,
  inferStructuredPromptType,
  isStructuredPromptLine,
  parseMatchFollowingPrompt,
} from "../lib/question-prompt-format.ts";

test("splits classic statement prompts into intro, statements, and footer", () => {
  const prompt =
    "Consider the following statements about the Swadeshi Movement: 1. It followed the partition of Bengal. 2. It encouraged indigenous enterprise. Which of the statements given above is/are correct?";

  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following statements about the Swadeshi Movement:",
    "1. It followed the partition of Bengal.",
    "2. It encouraged indigenous enterprise.",
    "Which of the statements given above is/are correct?",
  ]);
});

test("does not split decimal values into fake statements", () => {
  const prompt =
    "Consider the following statements regarding criteria for declaring Heat Waves in India: 1. A heat wave is declared when the maximum temperature reaches at least 40°C in plains. 2. A heat wave can be declared based on departure from normal temperature by 4.5°C to 6.4°C. Which of the statements given above is/are correct?";

  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following statements regarding criteria for declaring Heat Waves in India:",
    "1. A heat wave is declared when the maximum temperature reaches at least 40°C in plains.",
    "2. A heat wave can be declared based on departure from normal temperature by 4.5°C to 6.4°C.",
    "Which of the statements given above is/are correct?",
  ]);
});

test("classifies numbered component prompts as statement-type", () => {
  const prompt =
    "Consider the following components of climate physical risk: 1. Hazard 2. Exposure 3. Vulnerability Which of the above are correctly associated with climate physical risk assessment?";

  assert.equal(inferStructuredPromptType(prompt), "statement-type");
  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following components of climate physical risk:",
    "1. Hazard",
    "2. Exposure",
    "3. Vulnerability",
    "Which of the above are correctly associated with climate physical risk assessment?",
  ]);
});

test("classifies generic consider-the-following prompts when numbered markers are present", () => {
  const prompt =
    "Consider the following factors affecting monsoon variability: 1. ENSO 2. Indian Ocean Dipole Which of the above can influence monsoon rainfall in India?";

  assert.equal(inferStructuredPromptType(prompt), "statement-type");
  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following factors affecting monsoon variability:",
    "1. ENSO",
    "2. Indian Ocean Dipole",
    "Which of the above can influence monsoon rainfall in India?",
  ]);
});

test("keeps assertion-reason formatting intact", () => {
  const prompt =
    "Assertion (A): The Finance Commission is constituted every five years. Reason (R): It recommends the distribution of tax revenues between the Union and the States. Select the correct answer using the code given below.";

  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Assertion (A): The Finance Commission is constituted every five years.",
    "Reason (R): It recommends the distribution of tax revenues between the Union and the States.",
    "Select the correct answer using the code given below.",
  ]);
});

test("parses match-the-following prompts without regressing structured extraction", () => {
  const prompt =
    "Match the following: List I: A. Laterite soil B. Alluvial soil List II: 1. Rich in iron oxides 2. Deposited by rivers Select the correct answer using the code given below.";

  const parsed = parseMatchFollowingPrompt(prompt);

  assert.ok(parsed);
  assert.deepEqual(parsed?.leftItems, [
    { marker: "A", text: "Laterite soil" },
    { marker: "B", text: "Alluvial soil" },
  ]);
  assert.deepEqual(parsed?.rightItems, [
    { marker: "1", text: "Rich in iron oxides" },
    { marker: "2", text: "Deposited by rivers" },
  ]);
  assert.equal(
    parsed?.footer,
    "Select the correct answer using the code given below.",
  );
});

test("structured line detection only marks actual list markers", () => {
  assert.equal(isStructuredPromptLine("1. Hazard"), true);
  assert.equal(isStructuredPromptLine("A. Statement"), true);
  assert.equal(isStructuredPromptLine("4.5°C to 6.4°C"), false);
  assert.equal(
    isStructuredPromptLine(
      "Which of the above are correctly associated with climate physical risk assessment?",
    ),
    false,
  );
});

test("splits statement-i statement-ii prompts into structured lines", () => {
  const prompt =
    "Consider the following statements: Statement I: The Union Council of Ministers shall be collectively responsible to the House of the People. Statement II: A no-confidence motion can only be moved in the House of the People. Which one of the following is correct in respect of the above statements?";

  assert.equal(inferStructuredPromptType(prompt), "statement-type");
  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following statements:",
    "Statement I: The Union Council of Ministers shall be collectively responsible to the House of the People.",
    "Statement II: A no-confidence motion can only be moved in the House of the People.",
    "Which one of the following is correct in respect of the above statements?",
  ]);
});

test("splits roman-numbered statement prompts into structured lines", () => {
  const prompt =
    "With reference to the Delimitation Commission in India, consider the following statements: I. It is a Constitutional body. II. The orders issued by the Commission have the force of law. III. The Chief Election Commissioner of India acts as the ex-officio Chairperson of the Delimitation Commission. Which of the statements given above is/are correct?";

  assert.equal(inferStructuredPromptType(prompt), "statement-type");
  assert.deepEqual(formatQuestionPrompt(prompt), [
    "With reference to the Delimitation Commission in India, consider the following statements:",
    "I. It is a Constitutional body.",
    "II. The orders issued by the Commission have the force of law.",
    "III. The Chief Election Commissioner of India acts as the ex-officio Chairperson of the Delimitation Commission.",
    "Which of the statements given above is/are correct?",
  ]);
});

test("does not split year values like 1982 into fake statement lines", () => {
  const prompt =
    "Consider the following statements with reference to the International Seabed Authority (ISA): I. It is an autonomous international organization established under the United Nations Convention on the Law of the Sea (UNCLOS), 1982. II. Its headquarters is located in Kingston, Jamaica. III. India holds exploration contracts with the ISA. Which of the statements given above are correct?";

  assert.deepEqual(formatQuestionPrompt(prompt), [
    "Consider the following statements with reference to the International Seabed Authority (ISA):",
    "I. It is an autonomous international organization established under the United Nations Convention on the Law of the Sea (UNCLOS), 1982.",
    "II. Its headquarters is located in Kingston, Jamaica.",
    "III. India holds exploration contracts with the ISA.",
    "Which of the statements given above are correct?",
  ]);
});
