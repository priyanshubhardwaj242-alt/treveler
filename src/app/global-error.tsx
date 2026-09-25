"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "80px 20px" }}>
        <h1>Waypoint hit a critical error</h1>
        <p>Please refresh the page.</p>
        <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 100, marginTop: 16 }}>Try again</button>
      </body>
    </html>
  );
}
