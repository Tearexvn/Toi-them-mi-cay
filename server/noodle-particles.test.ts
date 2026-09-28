import { describe, expect, it } from "vitest";
import { interleaveNoodleAndTopping, NOODLE_BOWL_EMOJI } from "../shared/noodle-particles.js";

describe("interleaveNoodleAndTopping", () => {
  it.each([
    ["bò", "🥩"],
    ["đùi gà", "🍗"],
    ["bạch tuộc", "🐙"],
  ])("alternates noodles with the selected topping: %s", (_name, toppingEmoji) => {
    expect(interleaveNoodleAndTopping(toppingEmoji, 6)).toEqual([
      NOODLE_BOWL_EMOJI,
      toppingEmoji,
      NOODLE_BOWL_EMOJI,
      toppingEmoji,
      NOODLE_BOWL_EMOJI,
      toppingEmoji,
    ]);
  });

  it("returns no particles for non-positive counts", () => {
    expect(interleaveNoodleAndTopping("🥩", 0)).toEqual([]);
    expect(interleaveNoodleAndTopping("🥩", -3)).toEqual([]);
  });
});
