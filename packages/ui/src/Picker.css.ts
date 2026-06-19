/* Inline-style helpers for the picker. Kept dependency-free so the UI package
 * stays framework-pure (no styled-components, no CSS modules tooling). */
import type { CSSProperties } from "react";

const ITEM_HEIGHT = 40;

export const pickerWrapper: CSSProperties = {
  position: "relative",
  height: 160,
  overflow: "hidden",
  border: "1px solid #d0d0d0",
  borderRadius: 12,
  background: "#fafafa",
  touchAction: "none",
  userSelect: "none",
  /* The 3D drum effect: the scroller is a vertical cylinder; items are
   * rotated/translated/scaled around the x-axis based on their distance
   * from the center band. */
  perspective: 800,
  perspectiveOrigin: "50% 50%",
};

export const pickerScroller: CSSProperties = {
  height: "100%",
  overflowY: "auto",
  scrollSnapType: "y mandatory",
  WebkitOverflowScrolling: "touch",
  /* Children are laid out on a cylinder, not a flat plane. */
  transformStyle: "preserve-3d",
  position: "relative",
  zIndex: 1,
};

export const pickerItem: CSSProperties = {
  height: ITEM_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  scrollSnapAlign: "center",
  color: "#222",
  cursor: "pointer",
  /* transform-origin is the row's own center line, which keeps the
   * rotation pivoting around the middle of each row. */
  transformOrigin: "50% 50%",
  /* The per-frame transforms write to the four custom props below. */
  transform:
    "rotateX(var(--rx, 0deg)) translateZ(var(--tz, 0px)) scale(var(--sc, 1))",
  opacity: "var(--op, 1)",
  fontWeight: 500,
  /* Disable the CSS transition on transform — we set the transform on
   * every animation frame, so transitions would lag one frame behind
   * the user's finger. */
  transition: "none",
  willChange: "transform, opacity",
};

export const pickerHighlight: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  height: ITEM_HEIGHT,
  marginTop: -ITEM_HEIGHT / 2,
  borderTop: "1px solid #b0b0b0",
  borderBottom: "1px solid #b0b0b0",
  background: "rgba(0,0,0,0.04)",
  pointerEvents: "none",
  zIndex: 2,
};

export const pickerFadeTop: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "linear-gradient(to bottom, #fafafa, transparent)",
  pointerEvents: "none",
  zIndex: 3,
};

export const pickerFadeBottom: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "linear-gradient(to top, #fafafa, transparent)",
  pointerEvents: "none",
  zIndex: 3,
};

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontVariantNumeric: "tabular-nums",
};

export const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid #d0d0d0",
  background: "#f0f0f0",
  fontSize: 14,
};

export const tdStyle: CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
  fontSize: 15,
};

export const toggleTrack: CSSProperties = {
  position: "relative",
  width: 44,
  height: 24,
  borderRadius: 12,
  background: "#ccc",
  cursor: "pointer",
  transition: "background 0.15s",
};

export const toggleThumb: CSSProperties = {
  position: "absolute",
  top: 2,
  left: 2,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#fff",
  transition: "left 0.15s",
};
