import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ItineraryView } from "@/components/ItineraryView";
import { optimizeRoute } from "@/lib/optimizer";
import { MOCK_ATTRACTIONS } from "@/lib/mockData";

export const metadata = {
  title: "Example itinerary — Waypoint",
  description: "See what a Waypoint-optimized, day-by-day travel itinerary looks like, no account required."
};

const EXAMPLE_HOTEL = { name: "Alsisar Haveli", lat: 26.915, lng: 75.805, price: 4200 };

export default function ExampleTripPage() {
  const picks = MOCK_ATTRACTIONS.slice(0, 8);
  const { days } = optimizeRoute({
    hotel: EXAMPLE_HOTEL, attractions: picks, days: 2, dayStart: "08:30", dayEnd: "19:30"
  });

  return (
    <main>
      <Navbar />
      <div className="max-w-5xl mx-auto px-7 pt-10 pb-16">
        <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">● Example — no account needed</div>
        <h1 className="font-display text-4xl font-semibold mb-2">2 days in Jaipur, Rajasthan</h1>
        <p className="text-harbor/60 dark:text-[#A9BBB5] mb-8 max-w-lg">
          This is exactly what the optimizer produces from a real trip request — 8 attractions,
          2 travelers, ₹45,000 budget. Nothing here is edited by hand.
        </p>

        <ItineraryView
          days={days}
          hotelName={EXAMPLE_HOTEL.name}
          hotelPricePerNight={EXAMPLE_HOTEL.price}
          travelers={2}
          transportMode="own"
          tripBudget={45000}
        />

        <div className="card p-8 text-center mt-10">
          <h2 className="font-display text-xl font-semibold mb-2">Build one for your own trip</h2>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-5">Takes about two minutes, no credit card.</p>
          <Link href="/signup" className="btn-primary">Plan your trip →</Link>
        </div>
      </div>
    </main>
  );
}
