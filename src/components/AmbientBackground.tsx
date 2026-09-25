"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";

const GlobeBackground = dynamic(() => import("./GlobeScene"), { ssr: false });

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // WebGL can fail to initialize on some GPUs/browsers/virtualized
    // environments — degrade to no background rather than a crashed page.
    console.warn("3D background failed to initialize:", error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function AmbientBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none ambient-root" aria-hidden="true">
      <div className="absolute inset-0 ambient-vignette" />
      {!reducedMotion && (
        <CanvasErrorBoundary>
          <GlobeBackground />
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
