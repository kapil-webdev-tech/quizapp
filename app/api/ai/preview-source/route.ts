import { NextResponse } from "next/server";
import { extractAttachment } from "@/lib/source-extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const skipPagesValue = formData.get("skipPages");
    const skipPages =
      typeof skipPagesValue === "string"
        ? Math.max(0, Math.min(Number.parseInt(skipPagesValue, 10) || 0, 10))
        : 0;
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, 4);

    if (files.length === 0) {
      return NextResponse.json(
        {
          error:
            "Attach at least one PDF, image, or text file to preview extraction.",
        },
        { status: 400 },
      );
    }

    const attachments = await Promise.all(
      files.map((file) => extractAttachment(file, { skipPages })),
    );

    function splitText(text: string, maxLength = 10000) {
      const chunks: string[] = [];
      let start = 0;

      while (start < text.length) {
        chunks.push(text.slice(start, start + maxLength));
        start += maxLength;
      }

      return chunks;
    }

    const combinedText = attachments
      .filter((attachment) => attachment.text)
      .map((attachment) => `# ${attachment.name}\n${attachment.text}`)
      .join("\n\n");

    const chunks = splitText(combinedText, 10000);

    return NextResponse.json({
      attachments: attachments.map((attachment) => ({
        name: attachment.name,
        kind: attachment.kind,
        size: attachment.size,
        extractor: attachment.extractor ?? "none",
        status: attachment.status ?? "empty",
        warning: attachment.warning ?? "",
        text: attachment.text ?? "",
        pages: attachment.pages ?? [],
      })),
      combinedText,
      fullTextLength: combinedText.length,
      chunks,
      chunkCount: chunks.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preview extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
