import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AmbientBackground } from "@/components/AmbientBackground";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400","500","600","700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400","500","600","700"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  title: { default: "Waypoint — AI Trip Planner", template: "%s · Waypoint" },
  description: "Plan optimized, budget-aware, day-by-day travel itineraries.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Waypoint" },
  openGraph: {
    title: "Waypoint — AI Trip Planner",
    description: "Route-optimized, budget-aware, day-by-day travel itineraries.",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Waypoint — AI Trip Planner",
    description: "Route-optimized, budget-aware, day-by-day travel itineraries."
  }
};

// viewport-fit=cover + safe-area CSS lets content sit correctly around the
// notch/home-indicator on iPhone; themeColor colors the Safari chrome to match
// the brand instead of showing default white/black.
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EEE1" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1B1D" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-body`}>
        <AmbientBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
