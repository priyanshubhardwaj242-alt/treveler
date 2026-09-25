import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ItineraryView } from "@/components/ItineraryView";
import type { ItineraryDay } from "@/lib/optimizer";

export default async function TripPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) notFound();

  const trip = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!trip || trip.userId !== (session.user as any).id) notFound();

  const days = (trip.itineraryJson as unknown as ItineraryDay[]) ?? [];

  return (
    <main id="main-content">
      <Navbar />
      <div className="max-w-5xl mx-auto px-7 pt-10 pb-16">
        <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">● Saved trip</div>
        <h1 className="font-display text-4xl font-semibold mb-2">{trip.destination}</h1>
        <p className="text-harbor/60 dark:text-[#A9BBB5] mb-8">
          {trip.days} days · {trip.travelers} travelers · {trip.hotelTier} tier
        </p>
        {days.length > 0 ? (
          <ItineraryView
            days={days}
            hotelName={trip.hotelName || "Hotel"}
            hotelPricePerNight={trip.hotelPricePerNight || 4200}
            travelers={trip.travelers}
            transportMode={trip.transportMode as "own" | "need"}
            transportChoice={trip.transportChoice || undefined}
            tripBudget={trip.budget}
          />
        ) : (
          <p className="text-sm text-harbor/60">This trip doesn't have a generated itinerary yet.</p>
        )}
      </div>
    </main>
  );
}
