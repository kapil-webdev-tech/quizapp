export type StructuredPromptType =
  | "single-correct"
  | "statement-type"
  | "assertion-reason"
  | "match-the-following";

export type MatchFollowingItem = {
  marker: string;
  text: string;
};

export type MatchFollowingPrompt = {
  intro: string;
  listIHeading: string;
  listIIHeading: string;
  leftItems: MatchFollowingItem[];
  rightItems: MatchFollowingItem[];
  footer: string;
};

const NUMBERED_MARKER_PATTERN = /(?:^|\s)((?:[1-9]|10|[१-९]|१०))\.\s*\S/g;
const STATEMENT_MARKER_PATTERN =
  /(?:^|\s)(?:statement|stmt|कथन)\s*(?:[ivx]+|[0-9]+)\s*[:.]\s*\S/gi;
const ROMAN_MARKER_PATTERN = /(?:^|\s)([ivx]+)\.\s*\S/g;

function normalizePrompt(prompt: string) {
  return prompt.replace(/\s+/g, " ").trim();
}

function normalizeListMarkers(prompt: string) {
  return prompt
    .replace(/सूची[\s-]*I\b:?\s*/gi, "List I: ")
    .replace(/सूची[\s-]*II\b:?\s*/gi, "List II: ")
    .replace(/सूची[\s-]*1\b:?\s*/gi, "List I: ")
    .replace(/सूची[\s-]*2\b:?\s*/gi, "List II: ")
    .replace(/कॉलम\s*A\b:?\s*/gi, "Column A: ")
    .replace(/कॉलम\s*B\b:?\s*/gi, "Column B: ")
    .replace(/List[\s-]*I\b:?\s*/gi, "List I: ")
    .replace(/List[\s-]*II\b:?\s*/gi, "List II: ")
    .replace(/Column\s*A\b:?\s*/gi, "Column A: ")
    .replace(/Column\s*B\b:?\s*/gi, "Column B: ");
}

function hasNumberedStatements(prompt: string) {
  return Array.from(prompt.matchAll(NUMBERED_MARKER_PATTERN)).length >= 2;
}

function hasLabeledStatements(prompt: string) {
  return Array.from(prompt.matchAll(STATEMENT_MARKER_PATTERN)).length >= 2;
}

function hasRomanStatements(prompt: string) {
  return Array.from(prompt.matchAll(ROMAN_MARKER_PATTERN)).length >= 2;
}

function hasAssertionReasonMarkers(prompt: string) {
  return (
    /(assertion|कथन)\s*\(?a\)?[:.]?/i.test(prompt) &&
    /(reason|कारण)\s*\(?r\)?[:.]?/i.test(prompt)
  );
}

function hasMatchFollowingMarkers(prompt: string) {
  return (
    /match the following|मिलान/i.test(prompt) ||
    /column\s*a|column\s*b|कॉलम\s*a|कॉलम\s*b/i.test(prompt) ||
    /list[\s-]*i|list[\s-]*ii|सूची[\s-]*(?:i|ii|1|2)/i.test(prompt)
  );
}

function hasStatementPromptMarkers(prompt: string) {
  return (
    /consider the following|which of the statements|which of the following statements|which of the above/i.test(
      prompt,
    ) ||
    /निम्नलिखित|निम्न में से|उपर्युक्त|कूट|सही उत्तर चुन/i.test(prompt)
  );
}

export function inferStructuredPromptType(
  prompt: string,
): StructuredPromptType {
  const normalized = normalizePrompt(prompt).toLowerCase();

  if (hasAssertionReasonMarkers(normalized)) {
    return "assertion-reason";
  }

  if (hasMatchFollowingMarkers(normalized)) {
    return "match-the-following";
  }

  if (
    (
      hasNumberedStatements(normalized) ||
      hasLabeledStatements(normalized) ||
      hasRomanStatements(normalized)
    ) &&
    (hasStatementPromptMarkers(normalized) || !hasMatchFollowingMarkers(normalized))
  ) {
    return "statement-type";
  }

  return "single-correct";
}

export function formatQuestionPrompt(prompt: string) {
  const type = inferStructuredPromptType(prompt);
  const normalized = normalizeListMarkers(normalizePrompt(prompt));

  if (type === "assertion-reason") {
    return normalized
      .replace(/\s+((?:Assertion|कथन)\s*\(A\):?)/gi, "\n$1")
      .replace(/\s+((?:Reason|कारण)\s*\(R\):?)/gi, "\n$1")
      .replace(/\s+(Select the correct answer.*)$/i, "\n$1")
      .split("\n")
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  if (type === "match-the-following") {
    return normalized
      .replace(/\s+(Match the following[:]?)/gi, "\n$1")
      .replace(/\s+(Match List[\s-]*I.*?List[\s-]*II.*?$)/i, "\n$1")
      .replace(/\s+(List I:)/gi, "\n$1")
      .replace(/\s+(List II:)/gi, "\n$1")
      .replace(/\s+([A-D]\.\s+)/g, "\n$1")
      .replace(/\s+(\d+\.\s+)/g, "\n$1")
      .replace(/\s+(Select the correct answer.*)$/i, "\n$1")
      .split("\n")
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  if (type === "statement-type") {
    return normalized
      .replace(/:\s+((?:[1-9]|10|[१-९]|१०)\.\s+)/g, ":\n$1")
      .replace(/\s+((?:[1-9]|10|[१-९]|१०)\.\s+)/g, "\n$1")
      .replace(/\s+([IVX]+\.\s+)/g, "\n$1")
      .replace(/\s+((?:Statement|Stmt|कथन)\s*(?:[IVX]+|\d+)\s*:\s*)/g, "\n$1")
      .replace(/\s+(Which one of the following.*)$/i, "\n$1")
      .replace(/\s+(Which of the statements.*)$/i, "\n$1")
      .replace(/\s+(Which of the following.*)$/i, "\n$1")
      .replace(/\s+(Which of the above.*)$/i, "\n$1")
      .replace(/\s+(Select the correct answer.*)$/i, "\n$1")
      .replace(/\s+(नीचे दिए गए कूट.*?सही उत्तर चुनिए[:]?)$/i, "\n$1")
      .replace(/\s+(नीचे दिए गए कूट.*)$/i, "\n$1")
      .replace(/\s+(उपर्युक्त.*)$/i, "\n$1")
      .split("\n")
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  return [normalized];
}

export function isStructuredPromptLine(segment: string) {
  return (
    /^(?:[1-9]|10|[१-९]|१०)\.\s/.test(segment) ||
    /^[IVX]+\.\s/.test(segment) ||
    /^[A-D]\.\s/.test(segment) ||
    /^(Statement|Stmt|कथन)\s*(?:[IVX]+|\d+)\s*:/.test(segment) ||
    /^(Assertion|कथन)\s*\(A\):/.test(segment) ||
    /^(Reason|कारण)\s*\(R\):/.test(segment) ||
    segment.startsWith("Column A:") ||
    segment.startsWith("Column B:") ||
    segment.startsWith("List I:") ||
    segment.startsWith("List II:")
  );
}

function extractItems(section: string, markerPattern: RegExp) {
  const items: MatchFollowingItem[] = [];
  const regex = new RegExp(markerPattern.source, markerPattern.flags);
  const matches = Array.from(section.matchAll(regex));

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const marker = match[1];
    const start = match.index ?? 0;
    const contentStart = start + match[0].length;
    const nextStart =
      index + 1 < matches.length
        ? (matches[index + 1].index ?? section.length)
        : section.length;
    const text = section.slice(contentStart, nextStart).trim();

    if (text) {
      items.push({ marker, text });
    }
  }

  return items;
}

function extractHeading(section: string, firstMarkerPattern: RegExp) {
  const markerMatch = firstMarkerPattern.exec(section);
  if (!markerMatch || markerMatch.index === undefined) {
    return { heading: "", itemsSection: section.trim() };
  }

  return {
    heading: section.slice(0, markerMatch.index).trim(),
    itemsSection: section.slice(markerMatch.index).trim(),
  };
}

function extractTrailingItems(
  section: string,
  leftMarkerPattern: RegExp,
  rightMarkerPattern: RegExp,
) {
  const firstRightMarker = rightMarkerPattern.exec(section);
  const leftSection =
    firstRightMarker && firstRightMarker.index !== undefined
      ? section.slice(0, firstRightMarker.index).trim()
      : section;
  const rightSection =
    firstRightMarker && firstRightMarker.index !== undefined
      ? section.slice(firstRightMarker.index).trim()
      : section;

  const leftItems = extractItems(leftSection, leftMarkerPattern);
  const rightItems = extractItems(rightSection, rightMarkerPattern);

  return { leftItems, rightItems };
}

function extractInterleavedItems(section: string) {
  const tokenRegex = /\b([A-D]|\d+)\.\s*/g;
  const matches = Array.from(section.matchAll(tokenRegex));
  const leftItems: MatchFollowingItem[] = [];
  const rightItems: MatchFollowingItem[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const marker = match[1];
    const start = match.index ?? 0;
    const contentStart = start + match[0].length;
    const nextStart =
      index + 1 < matches.length
        ? (matches[index + 1].index ?? section.length)
        : section.length;
    const text = section.slice(contentStart, nextStart).trim();

    if (!text) {
      continue;
    }

    if (/^[A-D]$/i.test(marker)) {
      leftItems.push({ marker: marker.toUpperCase(), text });
      continue;
    }

    rightItems.push({ marker, text });
  }

  return { leftItems, rightItems };
}

function splitMatchFooter(section: string) {
  const footerMatch = section.match(
    /\s+((?:Select the correct answer[\s\S]*|Codes?|Code|कूट|सही मिलान|सही उत्तर)[\s\S]*)$/i,
  );

  if (!footerMatch || footerMatch.index === undefined) {
    return { content: section.trim(), footer: "" };
  }

  return {
    content: section.slice(0, footerMatch.index).trim(),
    footer: footerMatch[1].trim(),
  };
}

function isAnswerCodeFooter(footer: string) {
  const normalized = footer.replace(/\s+/g, " ").trim();
  const hasChoiceLabels = /(?:^|\s)[a-d]\)/i.test(normalized);
  const pairMatches =
    normalized.match(/\b(?:[A-D]\s*-\s*\d+|\d+\s*-\s*[A-D])\b/g) ?? [];

  return hasChoiceLabels && pairMatches.length >= 4;
}

function hasEmbeddedLeftMarkers(items: MatchFollowingItem[]) {
  return items.some((item) => /\b[A-D]\.\s+\S/.test(item.text));
}

function hasEmbeddedRightMarkers(items: MatchFollowingItem[]) {
  return items.some((item) => /\b\d+\.\s+\S/.test(item.text));
}

export function parseMatchFollowingPrompt(
  prompt: string,
): MatchFollowingPrompt | null {
  const normalized = normalizeListMarkers(normalizePrompt(prompt));
  const content = normalized;

  const leftHeadingMatches = Array.from(
    content.matchAll(/(?:List I:|Column A:)/gi),
  );
  const rightHeadingMatches = Array.from(
    content.matchAll(/(?:List II:|Column B:)/gi),
  );
  const leftHeadingMatch = leftHeadingMatches.at(-1);
  const rightHeadingMatch = rightHeadingMatches.at(-1);
  const contentListIIndex = leftHeadingMatch?.index ?? -1;
  const contentListIIIndex = rightHeadingMatch?.index ?? -1;

  if (
    contentListIIndex === -1 ||
    contentListIIIndex === -1 ||
    contentListIIIndex <= contentListIIndex
  ) {
    return null;
  }

  const intro = content
    .slice(0, contentListIIndex)
    .replace(/List I:/gi, "List I")
    .replace(/List II:/gi, "List II")
    .replace(/Column A:/gi, "Column A")
    .replace(/Column B:/gi, "Column B")
    .replace(/Match the following:?/i, "Match the following")
    .trim();
  const listISection = content
    .slice(
      contentListIIndex + (leftHeadingMatch?.[0].length ?? "List I:".length),
      contentListIIIndex,
    )
    .trim();
  const rawListIISection = content
    .slice(
      contentListIIIndex + (rightHeadingMatch?.[0].length ?? "List II:".length),
    )
    .trim();
  const footerSplit = splitMatchFooter(rawListIISection);
  const listIISection = footerSplit.content;

  const leftMeta = extractHeading(listISection, /\b([A-D])\.\s*/g);
  const rightMeta = extractHeading(listIISection, /\b(\d+)\.\s*/g);
  let leftItems = extractItems(leftMeta.itemsSection, /\b([A-D])\.\s*/g);
  let rightItems = extractItems(rightMeta.itemsSection, /\b(\d+)\.\s*/g);

  if (leftItems.length === 0 || rightItems.length === 0) {
    const trailingSection = listIISection;
    const trailingItems = extractTrailingItems(
      trailingSection,
      /\b([A-D])\.\s*/g,
      /\b(\d+)\.\s*/g,
    );

    if (leftItems.length === 0) {
      leftItems = trailingItems.leftItems;
    }
    if (rightItems.length === 0) {
      rightItems = trailingItems.rightItems;
    }
  }

  if (leftItems.length === 0 || rightItems.length === 0) {
    const interleavedItems = extractInterleavedItems(listIISection);

    if (leftItems.length === 0) {
      leftItems = interleavedItems.leftItems;
    }
    if (rightItems.length === 0) {
      rightItems = interleavedItems.rightItems;
    }
  }

  if (leftItems.length === 0 || rightItems.length === 0) {
    const interleavedItems = extractInterleavedItems(listISection);

    if (leftItems.length === 0) {
      leftItems = interleavedItems.leftItems;
    }
    if (rightItems.length === 0) {
      rightItems = interleavedItems.rightItems;
    }
  }

  if (
    listISection.match(/\b[A-D]\.\s*/g) &&
    listISection.match(/\b\d+\.\s*/g)
  ) {
    const interleavedItems = extractInterleavedItems(listISection);
    if (
      interleavedItems.leftItems.length > 0 &&
      interleavedItems.rightItems.length > 0
    ) {
      leftItems = interleavedItems.leftItems;
      rightItems = interleavedItems.rightItems;
    }
  }

  if (
    leftItems.length !== rightItems.length &&
    (listIISection.match(/\b[A-D]\.\s*/g) &&
      listIISection.match(/\b\d+\.\s*/g))
  ) {
    const interleavedItems = extractInterleavedItems(listIISection);
    if (
      interleavedItems.leftItems.length > 0 &&
      interleavedItems.rightItems.length > 0
    ) {
      leftItems = interleavedItems.leftItems;
      rightItems = interleavedItems.rightItems;
    }
  }

  if (
    leftItems.length !== rightItems.length &&
    listISection.match(/\b[A-D]\.\s*/g) &&
    listISection.match(/\b\d+\.\s*/g)
  ) {
    const interleavedItems = extractInterleavedItems(listISection);
    if (
      interleavedItems.leftItems.length > 0 &&
      interleavedItems.rightItems.length > 0
    ) {
      leftItems = interleavedItems.leftItems;
      rightItems = interleavedItems.rightItems;
    }
  }

  if (
    hasEmbeddedLeftMarkers(rightItems) ||
    hasEmbeddedRightMarkers(leftItems)
  ) {
    const interleavedItems = extractInterleavedItems(listIISection);

    if (
      interleavedItems.leftItems.length > 0 &&
      interleavedItems.rightItems.length > 0
    ) {
      leftItems = interleavedItems.leftItems;
      rightItems = interleavedItems.rightItems;
    }
  }

  if (
    hasEmbeddedLeftMarkers(rightItems) ||
    hasEmbeddedRightMarkers(leftItems)
  ) {
    const interleavedItems = extractInterleavedItems(listISection);

    if (
      interleavedItems.leftItems.length > 0 &&
      interleavedItems.rightItems.length > 0
    ) {
      leftItems = interleavedItems.leftItems;
      rightItems = interleavedItems.rightItems;
    }
  }

  if (leftItems.length === 0 || rightItems.length === 0) {
    return null;
  }

  const normalizedLeftHeading = /\b[A-D]\.\s*/.test(leftMeta.heading)
    ? ""
    : leftMeta.heading;
  const normalizedRightHeading = /(?:\b[A-D]\.\s*|\b\d+\.\s*)/.test(
    rightMeta.heading,
  )
    ? ""
    : rightMeta.heading;

  let footer = footerSplit.footer;
  const lastRightItem = rightItems[rightItems.length - 1];
  if (lastRightItem) {
    const footerMatch = lastRightItem.text.match(
      /^(.*?)(?:\s+)((?:Select the correct answer|Codes?|Code|कूट|सही मिलान|सही उत्तर).*)$/i,
    );
    if (footerMatch) {
      lastRightItem.text = footerMatch[1].trim();
      footer = footer || footerMatch[2].trim();
    }
  }

  if (isAnswerCodeFooter(footer)) {
    footer = "";
  }

  return {
    intro,
    listIHeading:
      normalizedLeftHeading ||
      (leftHeadingMatch?.[0].toLowerCase().includes("column")
        ? "Column A"
        : "List I"),
    listIIHeading:
      normalizedRightHeading ||
      (rightHeadingMatch?.[0].toLowerCase().includes("column")
        ? "Column B"
        : "List II"),
    leftItems,
    rightItems,
    footer,
  };
}
