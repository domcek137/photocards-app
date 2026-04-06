import { NextResponse } from "next/server";
import { addCard } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;
    const formData = await request.formData();

    const image = formData.get("image");
    const text = String(formData.get("text") || "");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Card text is required." }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const card = await addCard({
      setId,
      text,
      imageBuffer: Buffer.from(arrayBuffer),
      imageMimeType: image.type,
      imageOriginalName: image.name,
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
