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
    const file = formData
      .getAll("files")
      .find((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!file) {
      return NextResponse.json(
        { error: "Attach a PDF, text file, or image containing the answer key." },
        { status: 400 },
      );
    }

    const extracted = await extractAttachment(file, { skipPages });
    const text = extracted.text?.trim() ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "No readable answer key text was extracted from the uploaded file." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      name: extracted.name,
      extractor: extracted.extractor ?? "none",
      warning: extracted.warning ?? "",
      text,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Answer key import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
