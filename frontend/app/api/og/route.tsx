import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest) {
  const filePath = path.join(process.cwd(), "public", "og.png");
  const image = await readFile(filePath);

  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
