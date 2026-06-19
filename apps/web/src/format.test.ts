import { describe, expect, it } from "vitest";
import { formatMMSS } from "./format";

describe("formatMMSS", () => {
  it("formats whole minutes with zero-padded seconds", () => {
    expect(formatMMSS(0)).toBe("0:00");
    expect(formatMMSS(60)).toBe("1:00");
    expect(formatMMSS(120)).toBe("2:00");
    expect(formatMMSS(600)).toBe("10:00");
  });

  it("formats mixed minutes and seconds", () => {
    expect(formatMMSS(5)).toBe("0:05");
    expect(formatMMSS(59)).toBe("0:59");
    expect(formatMMSS(150)).toBe("2:30");
    expect(formatMMSS(599)).toBe("9:59");
  });

  it("floors sub-second remainders (no rounding up)", () => {
    expect(formatMMSS(59.9)).toBe("0:59");
    expect(formatMMSS(125.4)).toBe("2:05");
  });

  it("returns '—' for non-finite or negative values", () => {
    expect(formatMMSS(NaN)).toBe("—");
    expect(formatMMSS(Infinity)).toBe("—");
    expect(formatMMSS(-1)).toBe("—");
    expect(formatMMSS(-150)).toBe("—");
  });
});
