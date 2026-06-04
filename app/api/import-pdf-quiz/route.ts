import { NextResponse } from "next/server";
import { importUpscPdfQuiz } from "@/lib/upsc-pdf-import";

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
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (!pdfFile) {
      return NextResponse.json(
        { error: "Attach a PDF file to import a UPSC test paper." },
        { status: 400 },
      );
    }

    const imported = await importUpscPdfQuiz(pdfFile, skipPages);

    return NextResponse.json(imported);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
