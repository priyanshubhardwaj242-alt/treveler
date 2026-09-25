import { NextResponse } from "next/server";
import { optimizeRoute } from "@/lib/optimizer";
import type { OptimizeInput } from "@/lib/optimizer";

export async function POST(req: Request) {
  const body = (await req.json()) as OptimizeInput;
  if (!body.hotel || !body.attractions?.length || !body.days) {
    return NextResponse.json({ error: "hotel, attractions, and days are required" }, { status: 400 });
  }
  const result = optimizeRoute(body);
  return NextResponse.json(result);
}
