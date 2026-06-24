/* Inline-style helpers for the UI package. Kept dependency-free so the UI
 * package stays framework-pure (no styled-components, no CSS modules tooling).
 *
 * Ember Studio warm dark: terracotta accents on stone surfaces. Visual chrome
 * (colors, borders, fonts) is owned by the host app's stylesheet via the
 * .recipe-table className; these helpers carry only the structural bits. */
import type { CSSProperties } from "react";

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontVariantNumeric: "tabular-nums",
};

export const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
};

export const tdStyle: CSSProperties = {
  padding: "12px 16px",
};

export const toggleTrack: CSSProperties = {
  position: "relative",
  width: 44,
  height: 24,
  borderRadius: 12,
  background: "#44403C",
  border: "1px solid #3F3A36",
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
};

export const toggleThumb: CSSProperties = {
  position: "absolute",
  top: 2,
  left: 2,
  width: 18,
  height: 18,
  borderRadius: "50%",
  background: "#A8A29E",
  transition: "left 0.2s, background 0.2s",
};