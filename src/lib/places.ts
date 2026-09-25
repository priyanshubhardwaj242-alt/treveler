import { MOCK_ATTRACTIONS, MOCK_HOTELS, type Attraction, type Hotel } from "./mockData";

const KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

/**
 * searchAttractions
 * Live mode (KEY set): calls Google Places API "Nearby Search" for each
 * category (tourist_attraction, museum, park, hindu_temple, restaurant, ...)
 * around the geocoded destination and normalizes the response.
 * Mock mode (no KEY): returns bundled sample data so the whole app is
 * click-through-able with zero setup.
 */
export async function searchAttractions(destination: string): Promise<Attraction[]> {
  if (!KEY) {
    return MOCK_ATTRACTIONS;
  }

  const geo = await geocode(destination);
  if (!geo) return MOCK_ATTRACTIONS;

  const categories = [
    "tourist_attraction", "museum", "park", "hindu_temple",
    "shopping_mall", "restaurant", "night_club", "point_of_interest"
  ];

  const results: Attraction[] = [];
  for (const type of categories) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${geo.lat},${geo.lng}`);
    url.searchParams.set("radius", "15000");
    url.searchParams.set("type", type);
    url.searchParams.set("key", KEY);

    const res = await fetch(url.toString());
    const json = await res.json();
    for (const place of json.results ?? []) {
      results.push({
        id: place.place_id,
        name: place.name,
        cat: mapGoogleTypeToCategory(type),
        rating: place.rating ?? 4.0,
        reviews: place.user_ratings_total ?? 0,
        visit: 60,
        open: "09:00",
        close: "18:00",
        fee: 0,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        blurb: place.vicinity ?? "",
        photoRef: place.photos?.[0]?.photo_reference ?? null
      });
    }
  }
  // de-dupe by place id
  return Array.from(new Map(results.map(r => [r.id, r])).values());
}

export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!KEY) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", KEY);
  const res = await fetch(url.toString());
  const json = await res.json();
  const loc = json.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

export async function suggestHotels(destination: string, tier: string): Promise<Hotel[]> {
  if (!KEY) return MOCK_HOTELS[tier as keyof typeof MOCK_HOTELS] ?? MOCK_HOTELS.Standard;

  const geo = await geocode(destination);
  if (!geo) return MOCK_HOTELS.Standard;

  const priceLevel = { Budget: 1, Standard: 2, Premium: 3, Luxury: 4 }[tier] ?? 2;
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${geo.lat},${geo.lng}`);
  url.searchParams.set("radius", "15000");
  url.searchParams.set("type", "lodging");
  url.searchParams.set("minprice", String(Math.max(0, priceLevel - 1)));
  url.searchParams.set("maxprice", String(priceLevel));
  url.searchParams.set("key", KEY);

  const res = await fetch(url.toString());
  const json = await res.json();
  return (json.results ?? []).map((h: any) => ({
    id: h.place_id,
    name: h.name,
    rating: h.rating ?? 4.0,
    price: estimatePriceFromLevel(h.price_level ?? priceLevel),
    lat: h.geometry?.location?.lat,
    lng: h.geometry?.location?.lng
  }));
}

/** Real Directions/Distance-Matrix call — used by the optimizer when a key exists. */
export async function getTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ km: number; minutes: number } | null> {
  if (!KEY) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destinations", `${destination.lat},${destination.lng}`);
  url.searchParams.set("key", KEY);
  const res = await fetch(url.toString());
  const json = await res.json();
  const el = json.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK") return null;
  return { km: el.distance.value / 1000, minutes: el.duration.value / 60 };
}

function mapGoogleTypeToCategory(type: string): string {
  const map: Record<string, string> = {
    tourist_attraction: "Historical", museum: "Museums", park: "Nature",
    hindu_temple: "Temples", shopping_mall: "Shopping", restaurant: "Food",
    night_club: "Nightlife", point_of_interest: "Photography"
  };
  return map[type] ?? "Historical";
}

function estimatePriceFromLevel(level: number): number {
  return [1200, 2500, 4200, 8000, 18000][level] ?? 4200;
}
