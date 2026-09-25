export interface Attraction {
  id: string;
  name: string;
  cat: string;
  rating: number;
  reviews: number;
  visit: number; // minutes
  open: string; // "HH:MM"
  close: string;
  fee: number; // in local currency, 0 = free
  lat: number;
  lng: number;
  blurb: string;
  photoRef?: string | null;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  price: number; // per night
  lat: number;
  lng: number;
}

// Sample coordinates are real-ish (Jaipur) so the demo map/optimizer behaves
// sensibly even without a Maps key. Swapped automatically for live Places
// results once GOOGLE_MAPS_SERVER_KEY is set (see src/lib/places.ts).
export const MOCK_ATTRACTIONS: Attraction[] = [
  { id: "a1", name: "Amber Fort", cat: "Historical", rating: 4.7, reviews: 48210, visit: 120, open: "08:00", close: "17:30", fee: 200, lat: 26.9855, lng: 75.8513, blurb: "Hilltop Rajput fort with mirrored halls." },
  { id: "a2", name: "Hawa Mahal", cat: "Historical", rating: 4.4, reviews: 39120, visit: 45, open: "09:00", close: "16:30", fee: 50, lat: 26.9239, lng: 75.8267, blurb: "Iconic honeycomb sandstone facade." },
  { id: "a3", name: "City Palace", cat: "Historical", rating: 4.6, reviews: 32040, visit: 90, open: "09:30", close: "17:00", fee: 300, lat: 26.9258, lng: 75.8237, blurb: "Royal complex with courtyards and museum wings." },
  { id: "a4", name: "Jantar Mantar", cat: "Museums", rating: 4.5, reviews: 21870, visit: 60, open: "09:00", close: "16:00", fee: 50, lat: 26.9246, lng: 75.8246, blurb: "18th-century astronomical instruments." },
  { id: "a5", name: "Nahargarh Fort", cat: "Nature", rating: 4.5, reviews: 28510, visit: 100, open: "10:00", close: "17:30", fee: 200, lat: 26.9373, lng: 75.8154, blurb: "Sunset viewpoint over the pink city." },
  { id: "a6", name: "Jal Mahal", cat: "Photography", rating: 4.3, reviews: 33980, visit: 30, open: "00:00", close: "23:59", fee: 0, lat: 26.9537, lng: 75.8462, blurb: "Palace floating mid-lake." },
  { id: "a7", name: "Birla Mandir", cat: "Temples", rating: 4.6, reviews: 19870, visit: 40, open: "06:00", close: "20:00", fee: 0, lat: 26.8994, lng: 75.8144, blurb: "White marble temple." },
  { id: "a8", name: "Govind Dev Ji Temple", cat: "Temples", rating: 4.7, reviews: 15230, visit: 35, open: "05:00", close: "21:00", fee: 0, lat: 26.9257, lng: 75.8221, blurb: "Beloved Krishna temple." },
  { id: "a9", name: "Johari Bazaar", cat: "Shopping", rating: 4.3, reviews: 14520, visit: 75, open: "10:30", close: "21:00", fee: 0, lat: 26.9187, lng: 75.8258, blurb: "Jewelry and textile market lanes." },
  { id: "a10", name: "Chokhi Dhani", cat: "Food", rating: 4.4, reviews: 41230, visit: 150, open: "17:00", close: "23:00", fee: 800, lat: 26.7864, lng: 75.8235, blurb: "Rural-village themed dinner and folk shows." },
  { id: "a11", name: "Albert Hall Museum", cat: "Museums", rating: 4.4, reviews: 23980, visit: 70, open: "09:00", close: "17:00", fee: 150, lat: 26.9114, lng: 75.8195, blurb: "Indo-Saracenic museum building." },
  { id: "a12", name: "Panna Meena Ka Kund", cat: "Photography", rating: 4.6, reviews: 11230, visit: 25, open: "00:00", close: "23:59", fee: 0, lat: 26.9789, lng: 75.8508, blurb: "Symmetric stepwell photo spot." },
  { id: "a13", name: "Sisodia Rani Garden", cat: "Nature", rating: 4.2, reviews: 8120, visit: 50, open: "08:00", close: "18:00", fee: 55, lat: 26.8951, lng: 75.8646, blurb: "Terraced Mughal-style gardens." },
  { id: "a14", name: "Bar Palladio", cat: "Nightlife", rating: 4.3, reviews: 5230, visit: 90, open: "19:00", close: "01:00", fee: 0, lat: 26.9095, lng: 75.8064, blurb: "Blue-toned courtyard bar." }
];

export const MOCK_HOTELS: Record<string, Hotel[]> = {
  Budget: [
    { id: "h1", name: "Zostel Jaipur", rating: 4.5, price: 1200, lat: 26.9, lng: 75.81 },
    { id: "h2", name: "Vinayak Guest House", rating: 4.2, price: 1400, lat: 26.91, lng: 75.82 }
  ],
  Standard: [
    { id: "h3", name: "Alsisar Haveli", rating: 4.5, price: 4200, lat: 26.915, lng: 75.805 },
    { id: "h4", name: "Umaid Bhawan Heritage", rating: 4.3, price: 3800, lat: 26.92, lng: 75.81 }
  ],
  Premium: [
    { id: "h5", name: "Trident Jaipur", rating: 4.6, price: 7800, lat: 26.83, lng: 75.81 },
    { id: "h6", name: "ITC Rajputana", rating: 4.7, price: 8600, lat: 26.912, lng: 75.79 }
  ],
  Luxury: [
    { id: "h7", name: "Rambagh Palace", rating: 4.9, price: 22000, lat: 26.895, lng: 75.812 },
    { id: "h8", name: "Oberoi Rajvilas", rating: 4.9, price: 26500, lat: 26.85, lng: 75.87 }
  ]
};
