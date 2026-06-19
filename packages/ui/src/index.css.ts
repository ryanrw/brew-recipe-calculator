/* Inline-style helpers for the UI package. Kept dependency-free so the UI
 * package stays framework-pure (no styled-components, no CSS modules tooling).
 *
 * Cool night theme: slate borders, navy tints, cyan accent for headers. */
import type { CSSProperties } from "react";

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontVariantNumeric: "tabular-nums",
};

export const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid #334155",
  background: "#283449",
  color: "#cbd5e1",
  fontSize: 14,
};

export const tdStyle: CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #1e293b",
  color: "#e2e8f0",
  fontSize: 15,
};

export const toggleTrack: CSSProperties = {
  position: "relative",
  width: 44,
  height: 24,
  borderRadius: 12,
  background: "#475569",
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
  background: "#f1f5f9",
  transition: "left 0.15s",
};
