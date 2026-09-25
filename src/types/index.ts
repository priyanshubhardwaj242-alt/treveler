export interface TripFormData {
  destination: string;
  startLocation: string;
  budget: number;
  days: number;
  travelers: number;
  startDate: string;
  endDate: string;
  dayStart: string;
  dayEnd: string;
  hotelTier: "Budget" | "Standard" | "Premium" | "Luxury";
  interests: string[];
  transportPref: string[];
}

export interface AccommodationChoice {
  mode: "have" | "suggest";
  hotelName?: string;
  hotelAddress?: string;
}

export interface TransportChoice {
  mode: "own" | "need";
  choice?: "Rental Car" | "Taxi" | "Public Transport";
}
