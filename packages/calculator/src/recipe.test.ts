import { describe, expect, it } from "vitest";
import { calculateRecipe, redistributePours, round2 } from "./recipe";

describe("round2", () => {
  it("rounds to two decimals", () => {
    expect(round2(38.749)).toBe(38.75);
    expect(round2(38.744)).toBe(38.74);
    expect(round2(38.755)).toBe(38.76);
  });
});

describe("calculateRecipe", () => {
  it("matches the worked example from the requirements", () => {
    // 10g coffee, 1:17.5 ratio, 20g bloom, 4 pours
    const recipe = calculateRecipe({
      coffeeGrams: 10,
      ratio: 17.5,
      bloomGrams: 20,
      numPours: 4,
    });

    expect(recipe.totalWater).toBe(175);
    expect(recipe.remainingWater).toBe(155);
    expect(recipe.perPour).toBe(38.75);
    // Cumulative scale readings: 20, 58.75, 97.5, 136.25, 175
    expect(recipe.pours.map((p) => p.cumulativeGrams)).toEqual([
      58.75, 97.5, 136.25, 175,
    ]);
    expect(recipe.pours[0].deltaGrams).toBe(38.75);
  });

  it("distributes time across pours after bloom when provided", () => {
    const recipe = calculateRecipe({
      coffeeGrams: 10,
      ratio: 17.5,
      bloomGrams: 20,
      numPours: 4,
      bloomTimeSec: 45,
      totalTimeSec: 180,
    });

    // Bloom ends at 45s. Remaining 135s is split across 4 pours (33.75s each).
    expect(recipe.bloom.cumulativeTimeSec).toBe(45);
    expect(recipe.perPourTimeSec).toBe(33.75);
    expect(recipe.pours.map((p) => p.cumulativeTimeSec)).toEqual([
      78.75, 112.5, 146.25, 180,
    ]);
  });

  it("leaves time fields null when advanced timing is omitted", () => {
    const recipe = calculateRecipe({
      coffeeGrams: 10,
      ratio: 17.5,
      bloomGrams: 20,
      numPours: 4,
    });
    expect(recipe.pours[0].cumulativeTimeSec).toBeNull();
  });

  describe("edge cases", () => {
    it("clamps remainingWater to 0 when bloom equals total water", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 17.5,
        bloomGrams: 175, // == totalWater
        numPours: 4,
      });
      expect(recipe.remainingWater).toBe(0);
      expect(recipe.perPour).toBe(0);
      // Pours still render with 0g additions; cumulative stays at bloomGrams.
      expect(recipe.pours).toHaveLength(4);
      expect(recipe.pours.every((p) => p.deltaGrams === 0)).toBe(true);
      expect(recipe.pours.every((p) => p.cumulativeGrams === 175)).toBe(true);
    });

    it("clamps remainingWater to 0 when bloom exceeds total water", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 17.5,
        bloomGrams: 200, // > totalWater (175)
        numPours: 4,
      });
      expect(recipe.remainingWater).toBe(0);
      expect(recipe.perPour).toBe(0);
      expect(recipe.pours.every((p) => p.cumulativeGrams === 200)).toBe(true);
    });

    it("returns an empty pours array when numPours is 0", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 17.5,
        bloomGrams: 20,
        numPours: 0,
      });
      expect(recipe.pours).toEqual([]);
      expect(recipe.perPour).toBe(0);
      // remainingWater is still the real value so the UI can show "no pours".
      expect(recipe.remainingWater).toBe(155);
    });

    it("returns an empty pours array when numPours is negative", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 17.5,
        bloomGrams: 20,
        numPours: -3,
      });
      expect(recipe.pours).toEqual([]);
      expect(recipe.perPour).toBe(0);
    });

    it("returns null perPourTimeSec and empty pours when numPours is 0 and timing is on", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 17.5,
        bloomGrams: 20,
        numPours: 0,
        bloomTimeSec: 45,
        totalTimeSec: 180,
      });
      expect(recipe.pours).toEqual([]);
      expect(recipe.perPourTimeSec).toBeNull();
    });

    it("handles a 1:1 ratio (smallest reasonable ratio)", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 10,
        ratio: 1,
        bloomGrams: 3,
        numPours: 2,
      });
      expect(recipe.totalWater).toBe(10);
      expect(recipe.remainingWater).toBe(7);
      expect(recipe.perPour).toBe(3.5);
    });

    it("the last pour's cumulative grams equals total water (when bloom <= total)", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 18,
        ratio: 15,
        bloomGrams: 40,
        numPours: 5,
      });
      const last = recipe.pours[recipe.pours.length - 1];
      expect(last.cumulativeGrams).toBe(recipe.totalWater);
    });

    it("numPours=1 yields one pour that brings the scale to total water", () => {
      const recipe = calculateRecipe({
        coffeeGrams: 15,
        ratio: 15,
        bloomGrams: 30,
        numPours: 1,
      });
      expect(recipe.pours).toHaveLength(1);
      expect(recipe.pours[0].deltaGrams).toBe(recipe.remainingWater);
      expect(recipe.pours[0].cumulativeGrams).toBe(recipe.totalWater);
    });
  });
});

describe("redistributePours", () => {
  it("UC1: editing pour 1 to +20 leaves pours 2 & 3 each -10 (final cumulative preserved)", () => {
    // 4 rows = 1 bloom + 3 pours, base 65g/pour, edit pour 1 → 85g (+20).
    // Pours 2 & 3 should each drop to 55g.
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 225,
      numPours: 3,
      pourDeltas: [85, 65, 65],
      editedIndices: [0],
    });
    expect(r.deviationGrams).toBe(0);
    expect(r.pours.map((p) => p.deltaGrams)).toEqual([85, 55, 55]);
    expect(r.pours.map((p) => p.cumulativeGrams)).toEqual([115, 170, 225]);
  });

  it("UC2: editing pours 1, 2, 4 leaves the unedited pour 3 absorbing the inverse net", () => {
    // 5 rows = 1 bloom + 4 pours, base 30g/pour.
    // Edits: pour 1 +20 (→50), pour 2 -10 (→20), pour 4 -20 (→10).
    // Net edit = -10; pour 3 (the only unedited) absorbs +10, becoming 40.
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 150,
      numPours: 4,
      pourDeltas: [50, 20, 30, 10],
      editedIndices: [0, 1, 3],
    });
    expect(r.deviationGrams).toBe(0);
    expect(r.pours.map((p) => p.deltaGrams)).toEqual([50, 20, 40, 10]);
    expect(r.pours.map((p) => p.cumulativeGrams)).toEqual([80, 100, 140, 150]);
  });

  it("UC3: all pours edited, sum under total — no redistribution, deviation reported", () => {
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 150,
      numPours: 4,
      pourDeltas: [10, 10, 20, 60],
      editedIndices: [0, 1, 2, 3],
    });
    // deviation = totalWater − (bloom + sum) = 150 − 130 = +20 → "20g under".
    expect(r.deviationGrams).toBe(20);
    expect(r.pours.map((p) => p.deltaGrams)).toEqual([10, 10, 20, 60]);
    expect(r.pours.map((p) => p.cumulativeGrams)).toEqual([40, 50, 70, 130]);
  });

  it("UC3 variant: all pours edited but the sum matches the target — deviation is 0", () => {
    // Sanity check that the banner stays hidden when the user happens to hit
    // the right total across all four pours.
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 150,
      numPours: 4,
      pourDeltas: [40, 40, 20, 20],
      editedIndices: [0, 1, 2, 3],
    });
    expect(r.deviationGrams).toBe(0);
    expect(r.pours.map((p) => p.cumulativeGrams).at(-1)).toBe(150);
  });

  it("returns empty pours and zero deviation when numPours is 0", () => {
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 150,
      numPours: 0,
      pourDeltas: [],
      editedIndices: [],
    });
    expect(r.pours).toEqual([]);
    expect(r.deviationGrams).toBe(0);
  });

  it("with no edits, falls back to a uniform split (defensive — caller should not invoke)", () => {
    // 3 pours, target pour sum 100 → 33.33... each, residue on the last pour.
    const r = redistributePours({
      bloomGrams: 0,
      totalWater: 100,
      numPours: 3,
      pourDeltas: [0, 0, 0],
      editedIndices: [],
    });
    expect(r.deviationGrams).toBe(0);
    expect(r.pours.reduce((s, p) => s + p.deltaGrams, 0)).toBe(100);
    expect(r.pours[2].cumulativeGrams).toBe(100);
  });

  it("places the rounding residue on the last unedited pour so cumulatives land exactly", () => {
    // 3 pours, target pour sum 100. None edited → uneditedDelta = 100/3 = 33.33…
    // After rounding to 2dp the sum of the 3 pours is 99.99, so the last pour
    // should pick up the +0.01 residue.
    const r = redistributePours({
      bloomGrams: 0,
      totalWater: 100,
      numPours: 3,
      pourDeltas: [0, 0, 0],
      editedIndices: [],
    });
    // Sum exactly 100 (no deviation).
    const sum = r.pours.reduce((s, p) => s + p.deltaGrams, 0);
    expect(round2(sum)).toBe(100);
    expect(r.deviationGrams).toBe(0);
    // The last pour's cumulative must equal totalWater.
    expect(r.pours[2].cumulativeGrams).toBe(100);
  });

  it("clamps negative unedited deltas to 0 and reports the over-deviation", () => {
    // Target pour sum = 100 − 30 = 70. Edited sum = 100 (over by 30).
    // Leftover = 70 − 100 = −30 over 1 unedited pour = −30. Clamp to 0.
    // deviation = 100 − (30 + 100) = −30 (negative = over the ideal).
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 100,
      numPours: 3,
      pourDeltas: [50, 50, 0],
      editedIndices: [0, 1],
    });
    expect(r.pours[2].deltaGrams).toBe(0);
    expect(r.deviationGrams).toBe(-30);

    // All edited: same shape, deviation also surfaces the over-pour.
    const rAll = redistributePours({
      bloomGrams: 30,
      totalWater: 100,
      numPours: 3,
      pourDeltas: [50, 50, 0],
      editedIndices: [0, 1, 2],
    });
    expect(rAll.deviationGrams).toBe(-30);
  });

  it("clamps negative edits themselves (defensive — UI's min={0} should prevent this)", () => {
    // A negative edited value would otherwise drag unedited pours above target
    // and inflate the deviation. Negative edits are clamped to 0 first.
    const r = redistributePours({
      bloomGrams: 30,
      totalWater: 150,
      numPours: 2,
      pourDeltas: [-10, 0],
      editedIndices: [0],
    });
    // Edited clamp → 0. Target pour sum = 120. Leftover = 120. Unedited
    // (pour 2) gets 120.
    expect(r.pours[0].deltaGrams).toBe(0);
    expect(r.pours[1].deltaGrams).toBe(120);
    expect(r.deviationGrams).toBe(0);
  });

  it("propagates timing onto redistributed pours (last pour still lands at totalTime)", () => {
    const r = redistributePours(
      {
        bloomGrams: 30,
        totalWater: 225,
        numPours: 3,
        pourDeltas: [85, 65, 65],
        editedIndices: [0],
      },
      { bloomTimeSec: 45, totalTimeSec: 180 },
    );
    // Uniform spacing: 180 − 45 = 135 / 3 = 45s per pour.
    expect(r.pours.map((p) => p.cumulativeTimeSec)).toEqual([90, 135, 180]);
  });
});
