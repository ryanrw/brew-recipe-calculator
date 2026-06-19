import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  pickerFadeBottom,
  pickerFadeTop,
  pickerHighlight,
  pickerItem,
  pickerScroller,
  pickerWrapper,
} from "./Picker.css";

const ITEM_HEIGHT = 40;
/* How far (in px) the highlight band center sits below the scroller's
 * top edge when scrollTop is 0. With one hidden top spacer (height
 * ITEM_HEIGHT) and the band centered in a 160px container, this is
 * (160/2) = 80 — i.e. half the container height. */
const BAND_CENTER_AT_TOP = 80;
/* Drum geometry. radius/MAX_ANGLE controls how aggressively far rows
 * tilt; scaleK/opacityK control how quickly they shrink and fade. */
const RADIUS = 220;
const MAX_ANGLE_DEG = 35;
const SCALE_K = 0.12;
const OPACITY_K = 1 / 80;
const TZ_K = 1.5;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.15;

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

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  /* Per-row refs for the imperative transform write. */
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // When the controlled value changes, scroll to the matching item.
  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx < 0 || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({ top: idx * ITEM_HEIGHT });
  }, [value, values]);

  /**
   * Recompute and write the 3D transform of every row based on the
   * current scroll position. Called on every animation frame while a
   * scroll is in progress, plus once initially after mount.
   */
  const applyDrum = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const bandCenter = scroller.scrollTop + BAND_CENTER_AT_TOP;
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      // Distance from this row's center to the highlight band center.
      // +ITEM_HEIGHT/2 because the row's top sits at i*ITEM_HEIGHT, but
      // its center sits at i*ITEM_HEIGHT + ITEM_HEIGHT/2.
      const rowCenter = i * ITEM_HEIGHT + ITEM_HEIGHT / 2;
      const distance = rowCenter - bandCenter;
      const abs = Math.abs(distance);

      const angleDeg = (distance / RADIUS) * MAX_ANGLE_DEG;
      const scale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, 1 - abs * SCALE_K),
      );
      const opacity = Math.max(0.15, 1 - abs * OPACITY_K);
      const tz = -abs * TZ_K;

      el.style.setProperty("--rx", `${angleDeg}deg`);
      el.style.setProperty("--tz", `${tz}px`);
      el.style.setProperty("--sc", String(scale));
      el.style.setProperty("--op", String(opacity));
    }
  };

  // Run once after the DOM is ready so the initial frame is already styled.
  useLayoutEffect(() => {
    applyDrum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.length]);

  // Wire scroll → rAF-driven drum updates. The rAF loop is cancelled
  // automatically when the scroll stops firing (no new tick requested).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let rafId: number | null = null;
    let snapTimer: number | null = null;

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyDrum();
      });
    };

    const onScroll = () => {
      schedule();
      if (snapTimer !== null) window.clearTimeout(snapTimer);
      // After scrolling settles, snap to the nearest row and emit.
      snapTimer = window.setTimeout(() => {
        const idx = Math.round(scroller.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(values.length - 1, idx));
        const next = values[clamped];
        if (next !== value) onChange(next);
        scroller.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
        applyDrum();
      }, 80);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (snapTimer !== null) window.clearTimeout(snapTimer);
    };
  }, [values, value, onChange]);

  const formatValue = format ?? ((v: number) => String(v));

  return (
    <div style={pickerWrapper}>
      <div ref={scrollerRef} style={pickerScroller}>
        {/* Spacer item so the first value sits centered under the band. */}
        <div
          style={{ ...pickerItem, visibility: "hidden", pointerEvents: "none" }}
          aria-hidden
        />
        {values.map((v, i) => (
          <div
            key={v}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            style={pickerItem}
            onClick={() => onChange(v)}
            role="option"
            aria-selected={v === value}
          >
            {formatValue(v)}
          </div>
        ))}
        <div
          style={{ ...pickerItem, visibility: "hidden", pointerEvents: "none" }}
          aria-hidden
        />
      </div>
      <div style={pickerFadeTop} />
      <div style={pickerHighlight} />
      <div style={pickerFadeBottom} />
    </div>
  );
}
