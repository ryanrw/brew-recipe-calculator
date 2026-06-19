import { describe, expect, it } from "vitest";
import { calculateRecipe, round2 } from "./recipe";

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
});
