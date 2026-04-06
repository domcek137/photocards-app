import { NextResponse } from "next/server";
import { readPhotoFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ setId: string; fileName: string }> },
) {
  const { setId, fileName } = await params;
  const photo = await readPhotoFile(setId, fileName);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo.buffer), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
