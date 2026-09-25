"use client";
import { useEffect, useRef } from "react";

const KEY = "waypoint-trip-draft";

// Autosaves arbitrary wizard state to localStorage on every change, and
// hands back whatever was saved from a previous session (if any) so the
// wizard can rehydrate on mount. Fixes: a refresh mid-wizard used to wipe
// every selection with no recovery path.
export function useDraftPersistence<T>(state: T, enabled = true) {
  const first = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (first.current) { first.current = false; return; } // don't overwrite saved draft with initial blank state on mount
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable — non-fatal */ }
  }, [state, enabled]);
}

export function loadDraft<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try { localStorage.removeItem(KEY); } catch { /* non-fatal */ }
}
