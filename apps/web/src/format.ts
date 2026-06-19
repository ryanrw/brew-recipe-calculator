/**
 * Convert a number of seconds to a "m:ss" string for display alongside
 * the seconds-based time inputs. Returns "—" for non-finite, negative,
 * empty, or non-numeric values so the UI never shows "NaN" or "-1:30".
 * Accepts string or number for convenience (controlled inputs typically
 * carry strings).
 */
export function formatMMSS(value: number | string): string {
  const seconds = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
