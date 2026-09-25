// Small fetch wrapper so every API call gets consistent error handling
// instead of silently hanging on failure (the original wizard had no
// .catch() anywhere, so a failed request just left the UI spinning forever).
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Something went wrong (${res.status}). Please try again.`);
  }
  return res.json();
}
