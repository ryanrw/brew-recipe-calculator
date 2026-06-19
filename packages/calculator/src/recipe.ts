export interface PourStep {
  /** 1-indexed pour number, e.g. 1..numPours. Bloom is step 0. */
  index: number;
  /** Water added in this pour (grams). Same as perPour for all post-bloom pours. */
  deltaGrams: number;
  /** Cumulative scale reading after this pour lands (grams). */
  cumulativeGrams: number;
  /** Cumulative time at end of this pour (seconds), null if timing not enabled. */
  cumulativeTimeSec: number | null;
}

export interface RecipeInput {
  coffeeGrams: number;
  /** The "y" of a 1:y ratio. */
  ratio: number;
  bloomGrams: number;
  numPours: number;
  /** Advanced: bloom time in seconds. */
  bloomTimeSec?: number;
  /** Advanced: total brew time in seconds. */
  totalTimeSec?: number;
}

export interface Recipe {
  totalWater: number;
  /** totalWater - bloomGrams, clamped to >= 0. */
  remainingWater: number;
  /** remainingWater / numPours, or 0 if numPours <= 0 or remainingWater is 0. */
  perPour: number;
  bloom: PourStep;
  /** Empty when numPours <= 0. */
  pours: PourStep[];
  /** Seconds between bloom end and final pour end, or null. */
  perPourTimeSec: number | null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRecipe(input: RecipeInput): Recipe {
  const { coffeeGrams, ratio, bloomGrams, numPours } = input;

  const totalWater = round2(coffeeGrams * ratio);
  // Clamp remainingWater at 0 so over-blooming (bloom >= total) doesn't produce
  // negative per-pour amounts that would render as "-15 g" in the UI.
  const remainingWater = round2(Math.max(0, totalWater - bloomGrams));
  const perPour = numPours > 0 ? round2(remainingWater / numPours) : 0;

  const hasTiming =
    input.bloomTimeSec !== undefined && input.totalTimeSec !== undefined;

  const perPourTimeSec =
    hasTiming && numPours > 0
      ? round2((input.totalTimeSec! - input.bloomTimeSec!) / numPours)
      : null;

  const bloom: PourStep = {
    index: 0,
    deltaGrams: bloomGrams,
    cumulativeGrams: bloomGrams,
    cumulativeTimeSec: hasTiming ? round2(input.bloomTimeSec!) : null,
  };

  const pours: PourStep[] =
    numPours > 0
      ? Array.from({ length: numPours }, (_, i) => {
          const n = i + 1;
          return {
            index: n,
            deltaGrams: perPour,
            cumulativeGrams: round2(bloomGrams + n * perPour),
            cumulativeTimeSec:
              hasTiming && perPourTimeSec !== null
                ? round2(input.bloomTimeSec! + n * perPourTimeSec)
                : null,
          };
        })
      : [];

  return {
    totalWater,
    remainingWater,
    perPour,
    bloom,
    pours,
    perPourTimeSec,
  };
}
