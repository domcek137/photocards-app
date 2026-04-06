import { NextResponse } from "next/server";
import { createSet, listSets } from "@/lib/storage";

export async function GET() {
  const sets = await listSets();
  return NextResponse.json({ sets });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      setId?: string;
      name?: string;
      description?: string;
      tags?: string[];
    };

    const setId = (body.setId || "").trim();
    const name = (body.name || "").trim();

    if (!setId || !name) {
      return NextResponse.json(
        { error: "Both setId and name are required." },
        { status: 400 },
      );
    }

    const createdSet = await createSet({
      setId,
      name,
      description: body.description || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json({ set: createdSet }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create set.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
