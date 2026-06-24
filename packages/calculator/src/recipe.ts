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

export interface EditedPourInput {
  bloomGrams: number;
  /** Pre-computed coffeeGrams × ratio. */
  totalWater: number;
  numPours: number;
  /**
   * One entry per pour (0-based). pourDeltas[i] is the user's chosen delta
   * for pour (i+1). May be the original uniform value or an edit.
   */
  pourDeltas: number[];
  /** Indices (0-based) of pours the user explicitly edited. */
  editedIndices: number[];
}

export interface RedistributedPour {
  /** 1..numPours. */
  index: number;
  deltaGrams: number;
  /** bloom + sum(deltas[0..i]). */
  cumulativeGrams: number;
  /** Cumulative time at end of this pour, or null when timing is off. */
  cumulativeTimeSec: number | null;
}

export interface RedistributedRecipe {
  pours: RedistributedPour[];
  /**
   * totalWater − (bloomGrams + sum(deltas)).
   *   Positive  → user fell short of the ideal total (render as "under", red).
   *   Negative  → user exceeded the ideal total (render as "over", green).
   *   Zero      → exact; banner stays hidden.
   * Use this to drive the deviation banner.
   */
  deviationGrams: number;
}

export interface RedistributeTiming {
  bloomTimeSec: number;
  totalTimeSec: number;
}

/**
 * Redistribute pour deltas after a user has manually edited one or more pours.
 *
 * Invariant: the final cumulative reading still lands on `totalWater` (the
 * unedited reference) whenever at least one pour is unedited. Unedited pours
 * absorb the inverse of the net edit, split evenly. When every pour is edited
 * the system can't recover the target, so the user-provided deltas are kept
 * as-is and the deviation is reported.
 *
 * Rounding residue: when `targetPourSum / numUnedited` is a repeating decimal
 * (e.g. 100/3 = 33.33…), the last unedited pour is bumped by the cent-level
 * remainder so the cumulative ends exactly on `bloomGrams + targetPourSum`.
 *
 * Deltas are clamped to >= 0 — physically you cannot add a negative amount of
 * water, and the UI's `<input min={0}>` already prevents it, but the
 * calculator defends in depth.
 */
export function redistributePours(
  input: EditedPourInput,
  timing?: RedistributeTiming,
): RedistributedRecipe {
  const { bloomGrams, totalWater, numPours, pourDeltas, editedIndices } = input;

  if (numPours <= 0) {
    return { pours: [], deviationGrams: 0 };
  }

  const targetPourSum = Math.max(0, totalWater - bloomGrams);
  const editedSet = new Set(editedIndices);
  const numEdited = editedIndices.length;
  const numUnedited = numPours - numEdited;

  // Compute the resolved per-pour delta for every pour.
  const resolved: number[] = new Array(numPours);
  if (numUnedited === 0) {
    // Every pour is user-edited; keep the user's values verbatim.
    for (let i = 0; i < numPours; i++) {
      resolved[i] = Math.max(0, pourDeltas[i] ?? 0);
    }
  } else {
    const editedSum = editedIndices.reduce(
      (s, i) => s + Math.max(0, pourDeltas[i] ?? 0),
      0,
    );
    const leftover = targetPourSum - editedSum;
    const uneditedDeltaRaw = leftover / numUnedited;

    // Find the indices of unedited pours so we can put the rounding residue
    // on the last one.
    const uneditedIndices: number[] = [];
    for (let i = 0; i < numPours; i++) {
      if (!editedSet.has(i)) uneditedIndices.push(i);
    }

    // Base rounding: round2 every unedited pour.
    const uneditedRounded = round2(uneditedDeltaRaw);
    for (const i of uneditedIndices) {
      resolved[i] = Math.max(0, uneditedRounded);
    }
    // Add the cent-level residue to the last unedited pour so the cumulative
    // lands exactly on `bloomGrams + targetPourSum`.
    const last = uneditedIndices[uneditedIndices.length - 1];
    const sumAfterRounding =
      uneditedRounded * (uneditedIndices.length - 1) + uneditedRounded;
    const residue = round2(targetPourSum - editedSum - sumAfterRounding);
    if (residue !== 0) {
      resolved[last] = Math.max(0, round2(resolved[last] + residue));
    }

    for (let i = 0; i < numPours; i++) {
      if (editedSet.has(i)) {
        resolved[i] = Math.max(0, pourDeltas[i] ?? 0);
      }
    }
  }

  // Compute cumulatives.
  let running = 0;
  const pours: RedistributedPour[] = resolved.map((delta, i) => {
    running = round2(running + delta);
    return {
      index: i + 1,
      deltaGrams: delta,
      cumulativeGrams: round2(bloomGrams + running),
      cumulativeTimeSec: null,
    };
  });

  // Timing: keep the same uniform spacing used by calculateRecipe so the last
  // pour still lands at totalTime. We don't redistribute time across pours
  // the way we redistribute grams — time is a separate dimension and the
  // user only edits grams. This means an edited pour may finish "early" or
  // "late" relative to its ideal time slot, which is the expected behavior
  // when you pour more or less than the recipe suggests.
  if (timing && numPours > 0) {
    const perPourTime = round2(
      (timing.totalTimeSec - timing.bloomTimeSec) / numPours,
    );
    pours.forEach((p, i) => {
      p.cumulativeTimeSec = round2(timing.bloomTimeSec + (i + 1) * perPourTime);
    });
  }

  const pourSum = resolved.reduce((s, d) => s + d, 0);
  const deviationGrams = round2(
    totalWater - (bloomGrams + round2(pourSum)),
  );

  return { pours, deviationGrams };
}
