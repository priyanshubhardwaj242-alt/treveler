import { NextResponse } from "next/server";
import { geocode } from "@/lib/places";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  const result = await geocode(address);
  // Falls back to a neutral default so the map/optimizer never breaks
  // when no Maps key is configured.
  return NextResponse.json(result ?? { lat: 26.9124, lng: 75.7873, mock: true });
}
