import { NextResponse } from "next/server";
import { deleteSet, updateSet } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;
    const body = (await request.json()) as { name?: string };
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Set name is required." }, { status: 400 });
    }

    const setItem = await updateSet({ setId, name });
    return NextResponse.json({ set: setItem }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update set.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> },
) {
  try {
    const { setId } = await params;
    await deleteSet(setId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete set.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}