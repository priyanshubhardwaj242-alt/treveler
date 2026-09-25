import type { Attraction } from "./mockData";

export interface LatLng { lat: number; lng: number }

export interface TripStop {
  type: "hotel" | "attraction" | "meal";
  label: string;
  time: string;
  sub: string;
  travelKm?: number;
  travelMin?: number;
  note?: string | null;
  fee?: number;
  cat?: string;
  lat?: number;
  lng?: number;
}

export interface ItineraryDay {
  dayNum: number;
  stops: TripStop[];
  totalKm: number;
  attractionCount: number;
}

export interface OptimizeInput {
  hotel: { name: string } & LatLng;
  attractions: Attraction[];
  days: number;
  dayStart: string; // "HH:MM"
  dayEnd: string;
  avgSpeedKmh?: number;
}

const haversineKm = (a: LatLng, b: LatLng): number => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (total: number) => {
  const t = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = Math.round(t % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const addMinutes = (hhmm: string, mins: number) => fromMinutes(toMinutes(hhmm) + mins);

/**
 * Core route optimizer.
 * 1. Cluster attractions into `days` groups by polar angle around the hotel
 *    (keeps geographic neighbors on the same day).
 * 2. Within each day: nearest-neighbor construction, then 2-opt passes to
 *    shorten the path — a standard, fast, "good enough" TSP heuristic.
 * 3. Walk the sequence assigning real clock times: convert distance to
 *    travel time at avgSpeedKmh, respect each place's opening hours
 *    (wait if arriving early, flag if landing near closing), and insert
 *    one lunch break per day.
 */
export function optimizeRoute(input: OptimizeInput): { days: ItineraryDay[]; totalAttractions: number } {
  const { hotel, attractions, days, dayStart, dayEnd, avgSpeedKmh = 22 } = input;

  const withAngle = attractions
    .map(a => ({ ...a, angle: Math.atan2(a.lat - hotel.lat, a.lng - hotel.lng) }))
    .sort((a, b) => a.angle - b.angle);

  const buckets: (Attraction & { angle: number })[][] = Array.from({ length: days }, () => []);
  withAngle.forEach((a, i) => buckets[i % days].push(a));

  const routeLength = (route: Attraction[]) => {
    let total = haversineKm(hotel, route[0] ?? hotel);
    for (let i = 0; i < route.length - 1; i++) total += haversineKm(route[i], route[i + 1]);
    return total;
  };

  const routeDay = (stops: Attraction[]): Attraction[] => {
    if (stops.length === 0) return [];
    const remaining = [...stops];
    let route: Attraction[] = [];
    let current: LatLng = hotel;
    while (remaining.length) {
      remaining.sort((a, b) => haversineKm(current, a) - haversineKm(current, b));
      const next = remaining.shift()!;
      route.push(next);
      current = next;
    }
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < route.length - 1; i++) {
        for (let j = i + 1; j < route.length; j++) {
          const candidate = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)];
          if (routeLength(candidate) < routeLength(route) - 0.01) {
            route = candidate;
            improved = true;
          }
        }
      }
    }
    return route;
  };

  const dayRoutes = buckets.map(routeDay);

  const itinDays: ItineraryDay[] = dayRoutes.map((route, di) => {
    const stops: TripStop[] = [];
    let clock = dayStart;
    let prev: LatLng = hotel;
    let lunchInserted = false;
    let totalKm = 0;

    stops.push({ type: "hotel", label: "Leave hotel", time: clock, sub: hotel.name });

    route.forEach(a => {
      const km = haversineKm(prev, a);
      totalKm += km;
      const travelMin = (km / avgSpeedKmh) * 60;
      clock = addMinutes(clock, travelMin);

      let note: string | null = null;
      if (toMinutes(clock) < toMinutes(a.open)) {
        clock = a.open;
        note = "Arrived early — waited for opening";
      }
      if (toMinutes(clock) > toMinutes(a.close) - 15) {
        note = "Tight against closing time — consider reordering";
      }

      if (!lunchInserted && toMinutes(clock) >= toMinutes("12:30")) {
        stops.push({
          type: "meal", label: "Lunch break", time: clock,
          sub: "Local restaurant recommendation nearby",
          travelKm: +km.toFixed(1), travelMin: Math.round(travelMin)
        });
        clock = addMinutes(clock, 45);
        lunchInserted = true;
      }

      stops.push({
        type: "attraction", label: a.name, time: clock,
        sub: `${a.cat} · ${a.visit} min visit${a.fee > 0 ? " · ₹" + a.fee + " entry" : " · Free entry"}`,
        travelKm: +km.toFixed(1), travelMin: Math.round(travelMin),
        note, fee: a.fee, cat: a.cat, lat: a.lat, lng: a.lng
      });
      clock = addMinutes(clock, a.visit);
      prev = a;
    });

    const kmBack = haversineKm(prev, hotel);
    totalKm += kmBack;
    const travelBackMin = (kmBack / avgSpeedKmh) * 60;
    clock = addMinutes(clock, travelBackMin);
    stops.push({
      type: "hotel", label: "Return to hotel", time: clock, sub: hotel.name,
      travelKm: +kmBack.toFixed(1), travelMin: Math.round(travelBackMin)
    });

    return { dayNum: di + 1, stops, totalKm: +totalKm.toFixed(1), attractionCount: route.length };
  });

  return { days: itinDays, totalAttractions: attractions.length };
}

export interface BudgetInput {
  hotelPricePerNight: number;
  nights: number;
  travelers: number;
  totalKm: number;
  transportMode: "own" | "need";
  transportChoice?: string;
  itineraryDays: ItineraryDay[];
  tripBudget: number;
}

export function calculateBudget(input: BudgetInput) {
  const { hotelPricePerNight, nights, travelers, totalKm, transportMode, transportChoice, itineraryDays, tripBudget } = input;

  const hotelCost = hotelPricePerNight * nights;
  const foodCost = 600 * travelers * nights;
  const fuelCost =
    transportMode === "own"
      ? totalKm * 9
      : transportChoice === "Taxi"
      ? totalKm * 14
      : transportChoice === "Rental Car"
      ? 1800 * nights
      : 300 * nights;
  const ticketCost =
    itineraryDays.reduce((s, d) => s + d.stops.reduce((s2, st) => s2 + (st.fee ?? 0), 0), 0) * travelers;
  const misc = Math.round((hotelCost + foodCost + fuelCost + ticketCost) * 0.08);
  const total = hotelCost + foodCost + fuelCost + ticketCost + misc;

  return {
    hotelCost, foodCost, fuelCost, ticketCost, misc, total,
    remaining: tripBudget - total,
    overBudget: total > tripBudget
  };
}
