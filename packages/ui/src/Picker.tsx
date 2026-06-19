import { useEffect, useMemo, useRef } from "react";
import {
  pickerFadeBottom,
  pickerFadeTop,
  pickerHighlight,
  pickerItem,
  pickerScroller,
  pickerWrapper,
} from "./Picker.css";

const ITEM_HEIGHT = 40;

export interface PickerProps {
  /** Inclusive min value. */
  min: number;
  /** Inclusive max value. */
  max: number;
  /** Increment between values. */
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Optional formatter for the displayed label. Defaults to String(value). */
  format?: (value: number) => string;
}

export function Picker({
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
}: PickerProps) {
  const values = useMemo(() => {
    const out: number[] = [];
    // Guard against floating-point drift with decimals (e.g. ratio 2..20 with step 0.5).
    const decimals = (step.toString().split(".")[1] ?? "").length;
    const factor = Math.pow(10, decimals);
    for (let v = min; v <= max + 1e-9; v = Math.round(v * factor) / factor + step) {
      out.push(Math.round(v * factor) / factor);
    }
    return out;
  }, [min, max, step]);

  const ref = useRef<HTMLDivElement | null>(null);

  // When the controlled value changes, scroll to the matching item.
  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx < 0 || !ref.current) return;
    ref.current.scrollTo({ top: idx * ITEM_HEIGHT });
  }, [value, values]);

  // Detect snap: after the user releases, snap to the nearest item.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | null = null;
    const handleScroll = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(values.length - 1, idx));
        const next = values[clamped];
        if (next !== value) onChange(next);
        el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
      }, 80);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [values, value, onChange]);

  const formatValue = format ?? ((v: number) => String(v));

  return (
    <div style={pickerWrapper}>
      <div ref={ref} style={pickerScroller}>
        {/* Spacer items at the top so the first value is centered. */}
        <div style={{ ...pickerItem, visibility: "hidden" }} aria-hidden />
        {values.map((v) => (
          <div
            key={v}
            style={pickerItem}
            onClick={() => onChange(v)}
            role="option"
            aria-selected={v === value}
          >
            {formatValue(v)}
          </div>
        ))}
        <div style={{ ...pickerItem, visibility: "hidden" }} aria-hidden />
      </div>
      <div style={pickerFadeTop} />
      <div style={pickerHighlight} />
      <div style={pickerFadeBottom} />
    </div>
  );
}
