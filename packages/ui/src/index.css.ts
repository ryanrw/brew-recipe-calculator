/* Inline-style helpers for the UI package. Kept dependency-free so the UI
 * package stays framework-pure (no styled-components, no CSS modules tooling). */
import type { CSSProperties } from "react";

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
