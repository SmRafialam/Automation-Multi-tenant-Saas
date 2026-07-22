import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { generateCaption } from "@/lib/ai";

export async function POST(req: Request) {
  const { business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caption = await generateCaption({
    product: body.product,
    tone: body.tone,
    mediaType: body.media_type,
  });
  return NextResponse.json({ caption });
}
