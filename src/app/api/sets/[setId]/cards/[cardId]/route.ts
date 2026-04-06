import { NextResponse } from "next/server";
import { deleteCard, updateCard } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ setId: string; cardId: string }> },
) {
  try {
    const { setId, cardId } = await params;
    const formData = await request.formData();

    const image = formData.get("image");
    const text = String(formData.get("text") || "");

    if (!text.trim()) {
      return NextResponse.json({ error: "Card text is required." }, { status: 400 });
    }

    const updateInput: Parameters<typeof updateCard>[0] = {
      setId,
      cardId,
      text,
    };

    if (image instanceof File) {
      const arrayBuffer = await image.arrayBuffer();
      updateInput.imageBuffer = Buffer.from(arrayBuffer);
      updateInput.imageMimeType = image.type;
      updateInput.imageOriginalName = image.name;
    }

    const card = await updateCard(updateInput);

    return NextResponse.json({ card }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ setId: string; cardId: string }> },
) {
  try {
    const { setId, cardId } = await params;
    await deleteCard(setId, cardId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}