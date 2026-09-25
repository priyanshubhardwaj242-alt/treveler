import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(id: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.userId !== userId) return null;
  return trip;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trip = await assertOwnership(params.id, (session.user as any).id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trip = await assertOwnership(params.id, (session.user as any).id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = await prisma.trip.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trip = await assertOwnership(params.id, (session.user as any).id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.trip.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
