"use client";
import { useEffect, useState } from "react";
import type { Attraction, Hotel } from "@/lib/mockData";
import type { ItineraryDay } from "@/lib/optimizer";
import { motion, AnimatePresence } from "framer-motion";
import { ItineraryView } from "./ItineraryView";
import { Chip } from "./ui/Chip";
import { SkeletonAttractionGrid } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { ErrorBanner } from "./ui/ErrorBanner";
import { fetchJson } from "@/lib/fetchJson";
import { useDraftPersistence, loadDraft, clearDraft } from "@/hooks/useDraftPersistence";
import { useToast } from "./ui/Toast";

const INTERESTS = ["Nature", "Adventure", "Historical", "Food", "Shopping", "Nightlife", "Temples", "Museums", "Photography"];
const TRANSPORT_PREFS = ["Own Car", "Rental Car", "Taxi", "Public Transport"];
const TIERS = ["Budget", "Standard", "Premium", "Luxury"] as const;

const STEP_LABELS = ["Plan", "Stay & Transport", "Attractions", "Itinerary"];

interface DraftState {
  destination: string; startLocation: string; budget: number; days: number; travelers: number;
  startDate: string; endDate: string; dayStart: string; dayEnd: string;
  tier: (typeof TIERS)[number]; interests: string[]; transportPref: string;
}

export function TripPlanner() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const draft = typeof window !== "undefined" ? loadDraft<DraftState>() : null;
  const [destination, setDestination] = useState(draft?.destination ?? "Jaipur, Rajasthan");
  const [startLocation, setStartLocation] = useState(draft?.startLocation ?? "");
  const [budget, setBudget] = useState(draft?.budget ?? 45000);
  const [days, setDays] = useState(draft?.days ?? 3);
  const [travelers, setTravelers] = useState(draft?.travelers ?? 2);
  const [startDate, setStartDate] = useState(draft?.startDate ?? "");
  const [endDate, setEndDate] = useState(draft?.endDate ?? "");
  const [dayStart, setDayStart] = useState(draft?.dayStart ?? "08:30");
  const [dayEnd, setDayEnd] = useState(draft?.dayEnd ?? "19:30");
  const [tier, setTier] = useState<(typeof TIERS)[number]>(draft?.tier ?? "Standard");
  const [interests, setInterests] = useState<string[]>(draft?.interests ?? ["Historical", "Food", "Temples"]);
  const [transportPref, setTransportPref] = useState(draft?.transportPref ?? "Own Car");
  const [formError, setFormError] = useState("");
  const [restoredNotice, setRestoredNotice] = useState(!!draft);

  useDraftPersistence<DraftState>({
    destination, startLocation, budget, days, travelers, startDate, endDate,
    dayStart, dayEnd, tier, interests, transportPref
  });

  const [accommodationMode, setAccommodationMode] = useState<"have" | "suggest">("suggest");
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelSuggestions, setHotelSuggestions] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [transportMode, setTransportMode] = useState<"own" | "need">("own");
  const [transportChoice, setTransportChoice] = useState("Rental Car");
  const [hotelLoadError, setHotelLoadError] = useState("");

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);
  const [attractionsError, setAttractionsError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[] | null>(null);
  const [resolvedHotel, setResolvedHotel] = useState<{ name: string; lat: number; lng: number; price: number } | null>(null);
  const [buildingItinerary, setBuildingItinerary] = useState(false);
  const [buildError, setBuildError] = useState("");

  function toggleInterest(v: string) {
    setInterests(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  }

  function validatePlanStep(): string {
    if (!destination.trim()) return "Please enter a destination.";
    if (budget <= 0) return "Budget must be greater than zero.";
    if (days <= 0) return "Trip needs at least 1 day.";
    if (travelers <= 0) return "Trip needs at least 1 traveler.";
    return "";
  }

  function goToStay() {
    const err = validatePlanStep();
    if (err) { setFormError(err); return; }
    setFormError("");
    setStep(1);
  }

  async function loadHotelSuggestions() {
    setHotelLoadError("");
    try {
      const data = await fetchJson<Hotel[]>(`/api/places?destination=${encodeURIComponent(destination)}&type=hotels&tier=${tier}`);
      setHotelSuggestions(data);
      setSelectedHotel(data[0] ?? null);
    } catch (e) {
      setHotelLoadError(e instanceof Error ? e.message : "Couldn't load hotel suggestions.");
    }
  }

  async function goToAttractions() {
    setLoadingAttractions(true);
    setAttractionsError("");
    try {
      const data = await fetchJson<Attraction[]>(`/api/places?destination=${encodeURIComponent(destination)}`);
      setAttractions(data);
      setStep(2);
    } catch (e) {
      setAttractionsError(e instanceof Error ? e.message : "Couldn't load attractions.");
    } finally {
      setLoadingAttractions(false);
    }
  }

  async function resolveHotelForRouting(): Promise<{ name: string; lat: number; lng: number; price: number }> {
    if (accommodationMode === "suggest" && selectedHotel) {
      return { name: selectedHotel.name, lat: selectedHotel.lat, lng: selectedHotel.lng, price: selectedHotel.price };
    }
    const geo = await fetchJson<{ lat: number; lng: number }>(`/api/geocode?address=${encodeURIComponent(hotelAddress || destination)}`);
    const priceByTier = { Budget: 1500, Standard: 4200, Premium: 7800, Luxury: 22000 };
    return { name: hotelName || "Your hotel", lat: geo.lat, lng: geo.lng, price: priceByTier[tier] };
  }

  async function buildItinerary() {
    setBuildingItinerary(true);
    setBuildError("");
    try {
      const hotel = await resolveHotelForRouting();
      setResolvedHotel(hotel);
      const selected = attractions.filter(a => selectedIds.has(a.id));
      const data = await fetchJson<{ days: ItineraryDay[] }>("/api/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotel, attractions: selected, days, dayStart, dayEnd })
      });
      setItineraryDays(data.days);
      setStep(3);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : "Couldn't build your itinerary.");
    } finally {
      setBuildingItinerary(false);
    }
  }

  async function saveTrip() {
    setSaving(true);
    try {
      await fetchJson("/api/trips", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination, startLocation, budget, days, travelers,
          startDate: startDate || null, endDate: endDate || null, dayStart, dayEnd,
          hotelTier: tier, interests, transportPref: [transportPref],
          accommodationMode, hotelName: resolvedHotel?.name, hotelAddress,
          hotelLat: resolvedHotel?.lat, hotelLng: resolvedHotel?.lng, hotelPricePerNight: resolvedHotel?.price,
          transportMode, transportChoice,
          selectedPlaceIds: Array.from(selectedIds), itineraryJson: itineraryDays, status: "planned"
        })
      });
      setSaved(true);
      clearDraft();
      toast.push("Trip saved");
    } catch (e) {
      toast.push(e instanceof Error ? e.message : "Couldn't save this trip.", "error");
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    clearDraft();
    setStep(0);
    setSaved(false);
    setItineraryDays(null);
    setSelectedIds(new Set());
  }

  const filteredAttractions = attractions
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
    .filter(a => !catFilter || a.cat === catFilter);
  const categories = Array.from(new Set(attractions.map(a => a.cat)));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-coral" : "bg-mist dark:bg-[#28403F]"}`} />
        ))}
      </div>
      <div className="flex justify-between text-xs uppercase tracking-wider text-harbor/50 dark:text-[#A9BBB5] mb-4">
        {STEP_LABELS.map(l => <span key={l}>{l}</span>)}
      </div>

      {restoredNotice && step === 0 && (
        <div className="flex items-center justify-between gap-4 bg-gold/10 border border-gold/40 text-harbor dark:text-[#EFEAE0] rounded-xl px-4 py-3 text-sm mb-5">
          <span>Restored your unsaved trip details from last time.</span>
          <button
            onClick={() => { clearDraft(); setRestoredNotice(false); }}
            className="font-semibold underline underline-offset-2 flex-shrink-0"
          >
            Start fresh instead
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
      {step === 0 && (
        <motion.form
          key="step-0"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className="card p-8 space-y-5"
          onSubmit={e => { e.preventDefault(); goToStay(); }}
        >
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Destination"><input className="field-input" value={destination} onChange={e => setDestination(e.target.value)} required /></Field>
            <Field label="Starting location"><input className="field-input" value={startLocation} onChange={e => setStartLocation(e.target.value)} placeholder="e.g. Railway station" /></Field>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Total budget (₹)"><input type="number" className="field-input" value={budget} onChange={e => setBudget(+e.target.value)} min={1} /></Field>
            <Field label="Number of days"><input type="number" className="field-input" value={days} onChange={e => setDays(+e.target.value)} min={1} max={10} /></Field>
            <Field label="Number of travelers"><input type="number" className="field-input" value={travelers} onChange={e => setTravelers(+e.target.value)} min={1} /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Start date"><input type="date" className="field-input" value={startDate} onChange={e => setStartDate(e.target.value)} /></Field>
            <Field label="End date"><input type="date" className="field-input" value={endDate} onChange={e => setEndDate(e.target.value)} /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Daily start time"><input type="time" className="field-input" value={dayStart} onChange={e => setDayStart(e.target.value)} /></Field>
            <Field label="Daily end time"><input type="time" className="field-input" value={dayEnd} onChange={e => setDayEnd(e.target.value)} /></Field>
          </div>

          <SectionTitle>Hotel category</SectionTitle>
          <div className="flex gap-2.5" role="radiogroup" aria-label="Hotel category">
            {TIERS.map(t => (
              <button type="button" key={t} role="radio" aria-checked={tier === t} onClick={() => setTier(t)}
                className={`flex-1 py-3.5 rounded-xl border text-sm font-semibold ${
                  tier === t ? "border-coral bg-coral/10 text-coral-dark" : "border-mist dark:border-[#28403F]"
                }`}>{t}</button>
            ))}
          </div>

          <SectionTitle>Interests</SectionTitle>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
            {INTERESTS.map(v => (
              <Chip key={v} selected={interests.includes(v)} onClick={() => toggleInterest(v)}>{v}</Chip>
            ))}
          </div>

          <SectionTitle>Preferred transportation</SectionTitle>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred transportation">
            {TRANSPORT_PREFS.map(v => (
              <Chip key={v} selected={transportPref === v} onClick={() => setTransportPref(v)}>{v}</Chip>
            ))}
          </div>

          {formError && <ErrorBanner message={formError} />}

          <div className="flex justify-end pt-2">
            <button className="btn-primary">Continue to stay &amp; transport →</button>
          </div>
        </motion.form>
      )}

      {step === 1 && (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          <h2 className="font-display text-2xl font-semibold mb-4">Accommodation</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ChoiceCard
              title="I already have a hotel booking"
              body="Give us the name and address — resolved to coordinates for routing."
              selected={accommodationMode === "have"}
              onClick={() => setAccommodationMode("have")}
            />
            <ChoiceCard
              title="Suggest hotels for me"
              body="See options in your chosen category near the city center."
              selected={accommodationMode === "suggest"}
              onClick={() => { setAccommodationMode("suggest"); loadHotelSuggestions(); }}
            />
          </div>

          {accommodationMode === "have" ? (
            <div className="card p-6 mb-8 grid md:grid-cols-2 gap-5">
              <Field label="Hotel name"><input className="field-input" value={hotelName} onChange={e => setHotelName(e.target.value)} /></Field>
              <Field label="Hotel address"><input className="field-input" value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} /></Field>
            </div>
          ) : (
            <div className="card p-6 mb-8 space-y-2.5">
              {hotelLoadError && <ErrorBanner message={hotelLoadError} onRetry={loadHotelSuggestions} />}
              {!hotelLoadError && hotelSuggestions.length === 0 && (
                <div className="space-y-2.5 animate-pulse" aria-hidden="true">
                  {[0, 1].map(i => <div key={i} className="h-[70px] rounded-xl bg-mist dark:bg-[#28403F]" />)}
                </div>
              )}
              {hotelSuggestions.map(h => (
                <div key={h.id} onClick={() => setSelectedHotel(h)}
                  role="radio" aria-checked={selectedHotel?.id === h.id} tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedHotel(h); } }}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer ${
                    selectedHotel?.id === h.id ? "border-gold bg-gold/10" : "border-mist dark:border-[#28403F]"
                  }`}>
                  <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: "linear-gradient(135deg,#3E6259,#D9A441)" }} />
                  <div className="flex-1">
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-xs text-harbor/60">★ {h.rating} · {tier} tier</div>
                  </div>
                  <div className="font-mono font-bold">₹{h.price.toLocaleString("en-IN")}/night</div>
                </div>
              ))}
            </div>
          )}

          <h2 className="font-display text-2xl font-semibold mb-4">Transportation</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <ChoiceCard title="I have my own car" body="No transport cost added — we estimate fuel by distance."
              selected={transportMode === "own"} onClick={() => setTransportMode("own")} />
            <ChoiceCard title="I need transportation" body="Compare rental car, taxi, or public transport."
              selected={transportMode === "need"} onClick={() => setTransportMode("need")} />
          </div>
          {transportMode === "need" && (
            <div className="flex gap-2 mb-8" role="radiogroup" aria-label="Transport choice">
              {["Rental Car", "Taxi", "Public Transport"].map(v => (
                <Chip key={v} selected={transportChoice === v} onClick={() => setTransportChoice(v)}>{v}</Chip>
              ))}
            </div>
          )}

          {attractionsError && <ErrorBanner message={attractionsError} onRetry={goToAttractions} />}

          <div className="flex justify-between pb-10">
            <button onClick={() => setStep(0)} className="btn-outline">← Back</button>
            <button onClick={goToAttractions} className="btn-primary flex items-center gap-2" disabled={loadingAttractions}>
              {loadingAttractions && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              {loadingAttractions ? "Loading attractions…" : "Continue to attractions →"}
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          <h2 className="font-display text-2xl font-semibold mb-2">What do you want to see in {destination.split(",")[0]}?</h2>
          <p className="text-xs text-harbor/50 dark:text-[#A9BBB5] mb-5">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? "Live results from Google Places." : "Sample data — connect a Google Maps key for live results."}
          </p>

          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <label className="sr-only" htmlFor="attr-search">Search attractions</label>
            <input id="attr-search" className="field-input flex-1 min-w-[220px] rounded-full" placeholder="Search attractions…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {categories.map(c => (
                <Chip key={c} selected={catFilter === c} onClick={() => setCatFilter(catFilter === c ? null : c)}>{c}</Chip>
              ))}
            </div>
          </div>

          {loadingAttractions ? (
            <SkeletonAttractionGrid />
          ) : filteredAttractions.length === 0 ? (
            <EmptyState
              title="No attractions match"
              body="Try a different search term or clear your category filter."
              actionLabel={catFilter || search ? "Clear filters" : undefined}
              onAction={() => { setCatFilter(null); setSearch(""); }}
            />
          ) : (
            <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
              {filteredAttractions.map(a => {
                const isSel = selectedIds.has(a.id);
                return (
                  <div key={a.id} className="card card-interactive overflow-hidden flex flex-col">
                    <div className="h-32 relative" style={{ background: "linear-gradient(135deg,#3E6259,#D9A441)" }}>
                      <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full">{a.cat}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h4 className="font-display font-semibold">{a.name}</h4>
                      <div className="text-xs text-harbor/60 flex items-center gap-1.5"><span className="text-gold font-bold">★ {a.rating}</span>({a.reviews.toLocaleString("en-IN")})</div>
                      <p className="text-xs text-harbor/60 dark:text-[#A9BBB5]">{a.blurb}</p>
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-harbor/60">
                        <span className="bg-sand dark:bg-[#0E1B1D] border border-mist dark:border-[#28403F] px-2 py-1 rounded-full">⏱ {a.visit} min</span>
                        <span className="bg-sand dark:bg-[#0E1B1D] border border-mist dark:border-[#28403F] px-2 py-1 rounded-full">🕐 {a.open}–{a.close}</span>
                        <span className="bg-sand dark:bg-[#0E1B1D] border border-mist dark:border-[#28403F] px-2 py-1 rounded-full">{a.fee > 0 ? `₹${a.fee}` : "Free"}</span>
                      </div>
                      <button
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => setSelectedIds(prev => {
                          const next = new Set(prev);
                          next.has(a.id) ? next.delete(a.id) : next.add(a.id);
                          return next;
                        })}
                        className={`mt-auto py-2.5 rounded-lg text-sm font-semibold border focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral ${
                          isSel ? "bg-moss border-moss text-white" : "border-mist dark:border-[#28403F]"
                        }`}
                      >
                        {isSel ? "✓ Selected" : "+ Add to trip"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {buildError && <div className="mt-6"><ErrorBanner message={buildError} onRetry={buildItinerary} /></div>}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="btn-outline">← Back</button>
          </div>

          {selectedIds.size > 0 && (
            <div className="sticky bottom-5 flex justify-center mt-4" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
              <div className="bg-harbor dark:bg-coral text-white px-6 py-3.5 rounded-full flex items-center gap-4.5 shadow-xl">
                <span className="text-sm">{selectedIds.size} attraction{selectedIds.size !== 1 ? "s" : ""} selected</span>
                <button onClick={buildItinerary} disabled={buildingItinerary} className="bg-coral dark:bg-harbor text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2">
                  {buildingItinerary && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
                  {buildingItinerary ? "Building…" : "Build my itinerary →"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {step === 3 && itineraryDays && resolvedHotel && (
        <motion.div
          key="step-3"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          <h2 className="font-display text-2xl font-semibold mb-2">Your optimized itinerary</h2>
          <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] mb-7 max-w-2xl">
            {selectedIds.size} attractions across {itineraryDays.length} day{itineraryDays.length !== 1 ? "s" : ""}, starting and
            ending at {resolvedHotel.name}. Sequenced with nearest-neighbor + 2-opt routing, checked against opening hours.
          </p>

          <ItineraryView
            days={itineraryDays}
            hotelName={resolvedHotel.name}
            hotelPricePerNight={resolvedHotel.price}
            travelers={travelers}
            transportMode={transportMode}
            transportChoice={transportChoice}
            tripBudget={budget}
          />

          <div className="flex justify-end gap-3 mt-8 mb-16">
            <button onClick={startOver} className="btn-outline">Plan another trip</button>
            <button onClick={saveTrip} className="btn-primary flex items-center gap-2" disabled={saving || saved}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              {saved ? "✓ Saved" : saving ? "Saving…" : "Save this trip"}
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-harbor/60 dark:text-[#A9BBB5] mb-2">{label}</label>
      {children}
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-widest font-bold text-harbor/50 dark:text-[#A9BBB5] pt-2">{children}</div>;
}
function ChoiceCard({ title, body, selected, onClick }: { title: string; body: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick} role="radio" aria-checked={selected} tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`card p-[22px] cursor-pointer ${selected ? "border-moss bg-moss/10" : ""}`}
    >
      <h3 className="font-display font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-harbor/60 dark:text-[#A9BBB5]">{body}</p>
    </div>
  );
}
