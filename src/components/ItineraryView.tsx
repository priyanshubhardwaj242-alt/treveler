"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ItineraryDay } from "@/lib/optimizer";
import { calculateBudget } from "@/lib/optimizer";

const DAY_COLORS = ["#E8734A", "#3E6259", "#D9A441", "#4A6FA5", "#B54C4C"];

export function ItineraryView({
  days: initialDays,
  hotelName,
  hotelPricePerNight,
  travelers,
  transportMode,
  transportChoice,
  tripBudget
}: {
  days: ItineraryDay[];
  hotelName: string;
  hotelPricePerNight: number;
  travelers: number;
  transportMode: "own" | "need";
  transportChoice?: string;
  tripBudget: number;
}) {
  const [activeDay, setActiveDay] = useState(0);
  // Local mutable copy so a stop can be removed without discarding the whole
  // generated route and re-running the wizard from scratch.
  const [days, setDays] = useState(initialDays);
  const day = days[activeDay];
  const totalKm = days.reduce((s, d) => s + d.totalKm, 0);
  const budget = calculateBudget({
    hotelPricePerNight, nights: days.length, travelers, totalKm,
    transportMode, transportChoice, itineraryDays: days, tripBudget
  });

  // Rough per-day budget share, used only to color-code the tab badge —
  // not a precise per-day allocation, just a quick visual signal.
  function dayStatus(d: ItineraryDay): "ok" | "warn" | "over" {
    const dayShare = tripBudget / days.length;
    const dayCost = d.stops.reduce((s, st) => s + (st.fee ?? 0), 0) * travelers + hotelPricePerNight / days.length;
    if (dayCost > dayShare * 1.15) return "over";
    if (dayCost > dayShare * 0.9) return "warn";
    return "ok";
  }

  function removeStop(dayIdx: number, stopIdx: number) {
    setDays(prev => {
      const next = [...prev];
      const targetDay = { ...next[dayIdx] };
      const removed = targetDay.stops[stopIdx];
      const newStops = targetDay.stops.filter((_, i) => i !== stopIdx);
      const removedKm = removed?.travelKm ?? 0;
      targetDay.stops = newStops;
      targetDay.totalKm = Math.max(0, +(targetDay.totalKm - removedKm).toFixed(1));
      targetDay.attractionCount = newStops.filter(s => s.type === "attraction").length;
      next[dayIdx] = targetDay;
      return next;
    });
  }

  const color = DAY_COLORS[activeDay % DAY_COLORS.length];
  const attractionsInDay = day.stops.filter(s => s.lat && s.lng);
  const lats = attractionsInDay.map(s => s.lat!);
  const lngs = attractionsInDay.map(s => s.lng!);
  const minLat = Math.min(...lats, 0), maxLat = Math.max(...lats, 0);
  const minLng = Math.min(...lngs, 0), maxLng = Math.max(...lngs, 0);
  const norm = (lat: number, lng: number) => {
    const x = maxLng === minLng ? 260 : ((lng - minLng) / (maxLng - minLng)) * 460 + 30;
    const y = maxLat === minLat ? 260 : (1 - (lat - minLat) / (maxLat - minLat)) * 460 + 30;
    return { x, y };
  };

  const statusColor = { ok: "#3E6259", warn: "#D9A441", over: "#E8734A" };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6" role="tablist" aria-label="Itinerary days">
        {days.map((d, i) => {
          const status = dayStatus(d);
          return (
            <button
              key={d.dayNum}
              role="tab"
              aria-selected={i === activeDay}
              onClick={() => setActiveDay(i)}
              className={`px-4.5 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                i === activeDay ? "bg-harbor dark:bg-coral text-white border-harbor dark:border-coral shadow-md" : "border-mist dark:border-[#28403F]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: statusColor[status] }}
                title={status === "over" ? "Over daily budget share" : status === "warn" ? "Close to daily budget share" : "Within daily budget share"}
                aria-hidden="true"
              />
              Day {d.dayNum} · {d.attractionCount} stops
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          role="tabpanel"
          className="relative pl-1.5"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="absolute left-5 top-2 bottom-2 w-0.5" style={{
            backgroundImage: "linear-gradient(#DCE4E0 60%, transparent 40%)", backgroundSize: "2px 10px", backgroundRepeat: "repeat-y"
          }} />
          {day.stops.map((s, i) => (
            <div key={i}>
              {s.travelKm !== undefined && i > 0 && (
                <div className="flex items-center gap-2 text-xs text-harbor/60 dark:text-[#A9BBB5] py-1.5 pl-[60px]">
                  <span className="w-5 border-t border-dashed border-mist dark:border-[#28403F]" />
                  {s.travelKm} km · ~{s.travelMin} min travel
                  {s.note && <span className="text-coral-dark font-semibold">· {s.note}</span>}
                </div>
              )}
              <div className="flex gap-4 relative mb-5 group">
                <div
                  className="w-[42px] h-[42px] rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-semibold text-white z-10 border-4 border-sand dark:border-[#0E1B1D]"
                  style={{ background: s.type === "hotel" ? "#10242A" : s.type === "meal" ? "#D9A441" : "#3E6259" }}
                >
                  {s.type === "attraction" ? i : s.type === "hotel" ? "⌂" : "🍴"}
                </div>
                <div className="card px-4.5 py-3.5 flex-1 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-coral font-semibold mb-0.5">{s.time}</div>
                    <div className="font-display text-base font-semibold mb-0.5">{s.label}</div>
                    <div className="text-xs text-harbor/60 dark:text-[#A9BBB5]">{s.sub}</div>
                  </div>
                  {s.type === "attraction" && (
                    <button
                      onClick={() => removeStop(activeDay, i)}
                      aria-label={`Remove ${s.label} from this day`}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-harbor/40 hover:text-coral-dark dark:text-[#A9BBB5] flex-shrink-0 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        </AnimatePresence>

        <div>
          <div className="card overflow-hidden">
            <div className="aspect-square relative" style={{ background: "linear-gradient(135deg,#DCE9E4,#F4EEE1)" }}>
              <svg viewBox="0 0 520 520" className="w-full h-full" role="img" aria-label={`Map of day ${day.dayNum} route`}>
                <polyline
                  key={activeDay}
                  points={[{ x: 30, y: 490 }, ...attractionsInDay.map(s => norm(s.lat!, s.lng!)), { x: 30, y: 490 }]
                    .map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke={color} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round"
                  style={{ animation: "routeFadeIn 0.6s ease-out" }}
                />
                <circle cx={30} cy={490} r={11} fill="#10242A" />
                <text x={30} y={494} fontSize="10" fill="#fff" textAnchor="middle">⌂</text>
                {attractionsInDay.map((s, i) => {
                  const p = norm(s.lat!, s.lng!);
                  return (
                    <g key={`${activeDay}-${i}`} style={{ animation: `popIn 0.3s ease-out ${0.15 + i * 0.06}s backwards` }}>
                      <circle cx={p.x} cy={p.y} r={10} fill={s.type === "meal" ? "#D9A441" : color} />
                      <text x={p.x} y={p.y + 3.5} fontSize="10" fill="#fff" textAnchor="middle" fontWeight="600">{i + 1}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex gap-3 flex-wrap px-4.5 py-3.5 border-t border-mist dark:border-[#28403F] text-xs text-harbor/60 dark:text-[#A9BBB5]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-harbor inline-block" />Hotel</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />Day {day.dayNum} route</span>
              <span className="ml-auto font-mono">{day.totalKm} km today</span>
            </div>
          </div>

          <div className="card p-6 mt-5">
            <h3 className="font-display text-lg font-semibold mb-3.5">Budget calculator</h3>
            {[
              ["Hotel", budget.hotelCost], ["Food", budget.foodCost],
              [transportMode === "own" ? "Fuel (own car)" : transportChoice || "Transport", budget.fuelCost],
              ["Entry tickets", budget.ticketCost], ["Miscellaneous (8%)", budget.misc]
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between py-2 border-b border-dashed border-mist dark:border-[#28403F] text-sm">
                <span>{label}</span><span className="font-mono">₹{Math.round(val as number).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3.5 mt-1.5 border-t-2 border-harbor dark:border-[#EFEAE0] font-display text-lg font-semibold">
              <span>Estimated total</span><span>₹{Math.round(budget.total).toLocaleString("en-IN")}</span>
            </div>
            <div className={`text-xs mt-2.5 px-3.5 py-2.5 rounded-lg text-center font-semibold ${
              budget.overBudget ? "bg-coral/15 text-coral-dark" : "bg-moss/15 text-moss"
            }`} role="status">
              {budget.overBudget
                ? `₹${Math.round(-budget.remaining).toLocaleString("en-IN")} over your ₹${tripBudget.toLocaleString("en-IN")} budget`
                : `₹${Math.round(budget.remaining).toLocaleString("en-IN")} remaining within your ₹${tripBudget.toLocaleString("en-IN")} budget`}
            </div>
          </div>

          {travelers > 1 && (
            <SplitCostCard total={budget.total} travelers={travelers} destination={hotelName} />
          )}
        </div>
      </div>
    </div>
  );
}

function SplitCostCard({ total, travelers, destination }: { total: number; travelers: number; destination: string }) {
  const [names, setNames] = useState<string[]>(() => Array.from({ length: travelers }, (_, i) => `Traveler ${i + 1}`));
  const [copied, setCopied] = useState(false);
  const perPerson = total / travelers;

  function updateName(i: number, value: string) {
    setNames(prev => prev.map((n, idx) => (idx === i ? value : n)));
  }

  function copySummary() {
    const lines = names.map(n => `${n}: ₹${Math.round(perPerson).toLocaleString("en-IN")}`);
    const text = `${destination} trip — split ${travelers} ways (₹${Math.round(total).toLocaleString("en-IN")} total)\n${lines.join("\n")}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card p-6 mt-5 animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg font-semibold">Split the cost</h3>
        <span className="text-xs font-mono text-harbor/50 dark:text-[#A9BBB5]">÷ {travelers}</span>
      </div>
      <p className="text-xs text-harbor/60 dark:text-[#A9BBB5] mb-4">Split evenly across everyone on the trip.</p>

      <div className="space-y-2 mb-4">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              value={name}
              onChange={e => updateName(i, e.target.value)}
              aria-label={`Traveler ${i + 1} name`}
              className="flex-1 px-3 py-2 rounded-lg border border-mist dark:border-[#28403F] bg-sand dark:bg-[#0E1B1D] text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            />
            <span className="font-mono text-sm font-semibold whitespace-nowrap">
              ₹{Math.round(perPerson).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <button onClick={copySummary} className="btn-outline w-full text-sm">
        {copied ? "✓ Copied to clipboard" : "Copy split summary"}
      </button>
    </div>
  );
}
