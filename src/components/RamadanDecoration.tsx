"use client";

import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues (uses DOM APIs)
const RamadanOverlay = dynamic(
  () =>
    import("ramadan-overlay/react").then((mod) => ({
      default: mod.RamadanOverlay,
    })),
  { ssr: false },
);

/**
 * Ramadan decoration overlay using the website brand colors.
 *
 * Brand palette:
 *   Primary Teal  → #1B9AAA
 *   Success Green → #06D6A0
 *   Highlight Gold → #FFC43D
 *   Accent Pink   → #EF476F
 *
 * `previewMode` is enabled so the overlay shows before/during Ramadan 2026.
 * Set `autoTrigger={true}` and remove `previewMode` to restrict it to
 * the actual Hijri Ramadan period automatically.
 */
export function RamadanDecoration() {
  return (
    <RamadanOverlay
      variant="lanterns"
      position="both"
      opacity={0.9}
      colors={[
        "#FFC43D",
        "#1B9AAA",
        "#06D6A0",
        "#EF476F",
        "#FFC43D",
        "#1B9AAA",
        "#06D6A0",
        "#EF476F",
        "#FFC43D",
        "#1B9AAA",
        "#06D6A0",
        "#EF476F",
      ]}
      ceilingColor="#2d2d2d"
      ropeColor="#2d2d2d"
      glowColor="rgba(255, 179, 0, 0.45)"
      density="normal"
      locale="ar"
      previewMode={true}
      confetti={true}
    />
  );
}
