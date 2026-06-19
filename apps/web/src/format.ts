/**
 * Convert a number of seconds to a "m:ss" string for display alongside
 * the seconds-based time inputs. Returns "—" for non-finite or negative
 * values so the UI never shows "NaN" or "-1:30".
 */
export function formatMMSS(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
