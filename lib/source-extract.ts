import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import PDFParser from "pdf2json";
import * as Tesseract from "tesseract.js";

const execFileAsync = promisify(execFile);
const OCR_PAGE_LIMIT = 3;
const PDF_PAGE_LIMIT = 140;

export type ExtractedAttachmentPage = {
  pageNumber: number;
  text: string;
};

export type ExtractedAttachment = {
  name: string;
  type: string;
  size: number;
  kind: "pdf" | "text" | "image" | "file";
  text?: string;
  pages?: ExtractedAttachmentPage[];
  extractor?:
    | "pdf2json"
    | "pdftotext"
    | "pdftotext-pagewise"
    | "ocr-pdf"
    | "ocr-image"
    | "plain-text"
    | "none";
  status?: "success" | "empty" | "unsupported";
  warning?: string;
};

type ExtractAttachmentOptions = {
  skipPages?: number;
};

function normalizeExtractedText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildTextFromPages(pages: ExtractedAttachmentPage[]) {
  return pages
    .map((page) => `[Page ${page.pageNumber}]\n${page.text}`)
    .join("\n\n");
}

async function extractPdfPages(
  file: File,
  maxPages = PDF_PAGE_LIMIT,
  skipPages = 0,
) {
  const tempDir = await mkdtemp(join(tmpdir(), "quizapp-pdf-"));
  const inputPath = join(tempDir, "input.pdf");

  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    const pages: ExtractedAttachmentPage[] = [];

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

        const text = await readFile(outputPath, "utf8");

        if (!text.trim()) {
          continue;
        }

        const normalizedText = normalizeExtractedText(text);
        if (!normalizedText) {
          continue;
        }

        pages.push({ pageNumber, text: normalizedText });
      } catch {
        break;
      }
    }

    return pages;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractPdfText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return await new Promise<string>((resolve, reject) => {
    const parser = new PDFParser();

    parser.on(
      "pdfParser_dataError",
      (error: Error | { parserError: Error }) => {
        if (error instanceof Error) {
          reject(error);
          return;
        }

        reject(
          error.parserError instanceof Error
            ? error.parserError
            : new Error("Unable to parse PDF."),
        );
      },
    );

    parser.on("pdfParser_dataReady", () => {
      resolve(normalizeExtractedText(parser.getRawTextContent()));
    });

    parser.parseBuffer(buffer);
  });
}

async function extractPdfTextWithPdftotext(file: File) {
  const tempDir = await mkdtemp(join(tmpdir(), "quizapp-pdf-"));
  const inputPath = join(
    tempDir,
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "source.pdf",
  );
  const outputPath = join(tempDir, "source.txt");
  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    await execFileAsync("pdftotext", [
      "-layout",
      "-enc",
      "UTF-8",
      inputPath,
      outputPath,
    ]);
    const text = await readFile(outputPath, "utf8");
    return normalizeExtractedText(text);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function runOcrOnImage(imagePath: string) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    logger: () => {},
  });
  return normalizeExtractedText(result.data.text ?? "");
}

async function extractImageTextWithOcr(file: File) {
  const tempDir = await mkdtemp(join(tmpdir(), "quizapp-ocr-image-"));
  const inputPath = join(
    tempDir,
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "source-image",
  );

  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    return await runOcrOnImage(inputPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractPdfTextWithOcr(file: File) {
  const tempDir = await mkdtemp(join(tmpdir(), "quizapp-ocr-pdf-"));
  const inputPath = join(
    tempDir,
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "source.pdf",
  );
  const outputPrefix = join(tempDir, "page");

  try {
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    await execFileAsync("pdftoppm", [
      "-png",
      "-f",
      "1",
      "-l",
      String(OCR_PAGE_LIMIT),
      inputPath,
      outputPrefix,
    ]);
    const files = (await readdir(tempDir))
      .filter((entry) => entry.startsWith("page-") && entry.endsWith(".png"))
      .sort()
      .slice(0, OCR_PAGE_LIMIT);

    if (files.length === 0) {
      return "";
    }

    const parts: string[] = [];
    for (const pageFile of files) {
      const pageText = await runOcrOnImage(join(tempDir, pageFile));
      if (pageText) {
        parts.push(pageText);
      }
    }

    return normalizeExtractedText(parts.join("\n\n"));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractPlainText(file: File) {
  return normalizeExtractedText(await file.text());
}

export async function extractAttachment(
  file: File,
  options: ExtractAttachmentOptions = {},
): Promise<ExtractedAttachment> {
  const skipPages = Math.max(0, options.skipPages ?? 0);
  const kind =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "text/plain"
        ? "text"
        : file.type.startsWith("image/")
          ? "image"
          : "file";

  if (kind === "pdf") {
    try {
      const pages = await extractPdfPages(file, PDF_PAGE_LIMIT, skipPages);

      if (pages.length > 0) {
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          kind,
          pages,
          text: buildTextFromPages(pages),
          extractor: "pdftotext-pagewise",
          status: "success",
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Page-wise extraction failed.";

      try {
        const textFromPdf2Json = await extractPdfText(file);
        if (textFromPdf2Json) {
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            kind,
            text: textFromPdf2Json,
            extractor: "pdf2json",
            status: "success",
            warning: `Page-wise extraction failed: ${message}`,
          };
        }
      } catch {}
    }

    try {
      const textFromPdftotext = await extractPdfTextWithPdftotext(file);
      if (textFromPdftotext) {
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          kind,
          text: textFromPdftotext,
          extractor: "pdftotext",
          status: "success",
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Fallback parser failed.";
      try {
        const textFromOcr = await extractPdfTextWithOcr(file);
        if (textFromOcr) {
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            kind,
            text: textFromOcr,
            extractor: "ocr-pdf",
            status: "success",
            warning: `OCR fallback used: ${message}`,
          };
        }
      } catch {}
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      kind,
      extractor: "none",
      status: "empty",
      warning: "No extractable PDF text found.",
    };
  }

  if (kind === "text") {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      kind,
      text: await extractPlainText(file),
      extractor: "plain-text",
      status: "success",
    };
  }

  if (kind === "image") {
    try {
      const textFromImageOcr = await extractImageTextWithOcr(file);
      if (textFromImageOcr) {
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          kind,
          text: textFromImageOcr,
          extractor: "ocr-image",
          status: "success",
        };
      }
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        kind,
        extractor: "none",
        status: "empty",
        warning: "Image OCR ran but did not detect usable text.",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image OCR failed.";
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        kind,
        extractor: "none",
        status: "empty",
        warning: `Image OCR failed: ${message}`,
      };
    }
  }

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    kind,
    extractor: "none",
    status: "unsupported",
  };
}

export function buildAttachmentContext(attachments: ExtractedAttachment[]) {
  if (attachments.length === 0) {
    return "";
  }

  return `\n\nAttached source references:\n${attachments
    .map((attachment, index) => {
      const base = `- Source ${index + 1}: ${attachment.name} (${attachment.kind}, ${attachment.size} bytes)`;
      if (attachment.pages && attachment.pages.length > 0) {
        return `${base}\n  Extracted text by page:\n${attachment.pages
          .map((page) => `  [Page ${page.pageNumber}] ${page.text}`)
          .join("\n")}`;
      }
      if (attachment.text) {
        return `${base}\n  Extracted text: ${attachment.text}`;
      }
      return base;
    })
    .join(
      "\n",
    )}\nUse these references as context cues only when relevant. If PDF or text source material is attached, prioritize it as source material for factual MCQs.`;
}
