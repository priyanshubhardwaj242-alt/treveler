import { Navbar } from "@/components/Navbar";
import { TripPlanner } from "@/components/TripPlanner";

export default function DashboardPage() {
  return (
    <main id="main-content">
      <Navbar />
      <div className="max-w-5xl mx-auto px-7 pt-10 pb-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">● New trip</div>
        <h1 className="font-display text-4xl font-semibold mb-2">Where to?</h1>
        <p className="text-harbor/60 dark:text-[#A9BBB5] mb-8 max-w-lg">
          Fill in your trip details and we'll cluster attractions, sequence them, and build a day-by-day route.
        </p>
        <TripPlanner />
      </div>
    </main>
  );
}
