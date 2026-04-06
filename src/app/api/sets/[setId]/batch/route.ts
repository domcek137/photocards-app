import { NextResponse } from "next/server";
import { addBatchCards } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;
    const formData = await request.formData();
    const methodValue = String(formData.get("method") || "txt-file");
    const method =
      methodValue === "from-filename" ? "from-filename" : "txt-file";

    const photos = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File);

    const textsFile = formData.get("textsFile");

    if (method === "txt-file" && !(textsFile instanceof File)) {
      return NextResponse.json({ error: "Text file is required." }, { status: 400 });
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { error: "At least one photo is required." },
        { status: 400 },
      );
    }

    const imported = await addBatchCards({
      setId,
      photos,
      method,
      textsFile: textsFile instanceof File ? textsFile : undefined,
    });

    return NextResponse.json({ importedCount: imported.length }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch import failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
