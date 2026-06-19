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
