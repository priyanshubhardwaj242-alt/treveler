import { NextResponse } from "next/server";
import { searchAttractions, suggestHotels } from "@/lib/places";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") || "";
  const type = searchParams.get("type") || "attractions";
  const tier = searchParams.get("tier") || "Standard";

  if (type === "hotels") {
    const hotels = await suggestHotels(destination, tier);
    return NextResponse.json(hotels);
  }
  const attractions = await searchAttractions(destination);
  return NextResponse.json(attractions);
}
