import test from "node:test";
import assert from "node:assert/strict";

import {
  extractSequentialQuestionBlocks,
  parseQuestionBlock,
  reorderTwoColumnPage,
} from "../lib/upsc-pdf-import.ts";

test("reorders two-column UPSC page text into left-then-right reading order", () => {
  const page = `
PTS 2026 | Test Code: 311413

Q1) First left question stem                   Q3) First right question stem
continued on next line                         a) Right option one
a) Left option one                             b) Right option two
b) Left option two                             c) Right option three
c) Left option three                           d) Right option four
d) Left option four

Q2) Second left question stem                  Q4) Second right question stem
a) Left two option one                         a) Right two option one
b) Left two option two                         b) Right two option two
c) Left two option three                       c) Right two option three
d) Left two option four                        d) Right two option four
`;

  const reordered = reorderTwoColumnPage(page);

  assert.match(reordered, /Q1\) First left question stem[\s\S]*Q2\) Second left question stem[\s\S]*Q3\) First right question stem[\s\S]*Q4\) Second right question stem/);
});

test("extracts sequential question blocks starting from question 1", () => {
  const source = `
Q1) First question a) One b) Two c) Three d) Four
Q2) Second question a) One b) Two c) Three d) Four
Q3) Third question a) One b) Two c) Three d) Four
`;

  const blocks = extractSequentialQuestionBlocks(source, 3);

  assert.deepEqual(
    blocks.map((item) => item.number),
    [1, 2, 3],
  );
});

test("extracts sequential numbered question blocks when papers start with 1.", () => {
  const source = `
1. First question a) One b) Two c) Three d) Four

2. Second question a) One b) Two c) Three d) Four

3. Third question a) One b) Two c) Three d) Four
`;

  const blocks = extractSequentialQuestionBlocks(source, 3);

  assert.deepEqual(
    blocks.map((item) => item.number),
    [1, 2, 3],
  );
  assert.match(blocks[0].text, /^Q1\)/);
});

test("parses imported MCQ blocks into editable questions", () => {
  const question = parseQuestionBlock(
    "Q12) With reference to the Cabinet Mission Plan, consider the following statements: 1. It proposed a federal structure. 2. It accepted sovereign Pakistan. a) 1 only b) 2 only c) Both 1 and 2 d) Neither 1 nor 2",
    11,
    "gs",
  );

  assert.equal(
    question.prompt,
    "With reference to the Cabinet Mission Plan, consider the following statements: 1. It proposed a federal structure. 2. It accepted sovereign Pakistan.",
  );
  assert.deepEqual(question.options, [
    "1 only",
    "2 only",
    "Both 1 and 2",
    "Neither 1 nor 2",
  ]);
  assert.equal(question.answer, "a");
});

test("removes forum header and footer garbage from imported statement prompts", () => {
  const question = parseQuestionBlock(
    "Q12) Consider the following statements: Forum Learning Centre: Delhi - Plot No. 36, 4th Floor (Above Kalyan Jewellers), Pusa Road, Karol Bagh, New Delhi - 110005 | Patna - 2nd floor, AG Palace, E Boring Canal Road, Bihar 800001 | Hyderabad - 1st & 2nd Floor, SM Plaza, Jawahar Nagar, Telangana 500020 9311740400, 9311740900 | https://academy.forumias.com | admissions@forumias.academy | helpdesk@forumias.academy Page 4 Statement I: The Union Council of Ministers shall be collectively responsible to the House of the People. Statement II: A no-confidence motion can only be moved in the House of the People. Which one of the following is correct in respect of the above statements? a) Both Statement I and Statement II are correct and Statement II explains Statement I b) Both Statement I and Statement II are correct but Statement II does not explain Statement I c) Statement I is correct but Statement II is incorrect d) Statement I is incorrect but Statement II is correct",
    11,
    "gs",
  );

  assert.equal(
    question.prompt,
    "Consider the following statements: Statement I: The Union Council of Ministers shall be collectively responsible to the House of the People. Statement II: A no-confidence motion can only be moved in the House of the People. Which one of the following is correct in respect of the above statements?",
  );
  assert.doesNotMatch(question.prompt, /forumias|academy\.forumias|Page 4|931174/i);
});
