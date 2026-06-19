/* Inline-style helpers for the picker. Kept dependency-free so the UI package
 * stays framework-pure (no styled-components, no CSS modules tooling). */
import type { CSSProperties } from "react";

export const pickerWrapper: CSSProperties = {
  position: "relative",
  height: 160,
  overflow: "hidden",
  border: "1px solid #d0d0d0",
  borderRadius: 12,
  background: "#fafafa",
  touchAction: "none",
  userSelect: "none",
};

export const pickerScroller: CSSProperties = {
  height: "100%",
  overflowY: "auto",
  scrollSnapType: "y mandatory",
  WebkitOverflowScrolling: "touch",
};

export const pickerItem: CSSProperties = {
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  scrollSnapAlign: "center",
  color: "#222",
  cursor: "pointer",
};

export const pickerHighlight: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  height: 40,
  marginTop: -20,
  borderTop: "1px solid #999",
  borderBottom: "1px solid #999",
  background: "rgba(0,0,0,0.04)",
  pointerEvents: "none",
};

export const pickerFadeTop: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "linear-gradient(to bottom, #fafafa, transparent)",
  pointerEvents: "none",
};

export const pickerFadeBottom: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "linear-gradient(to top, #fafafa, transparent)",
  pointerEvents: "none",
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
