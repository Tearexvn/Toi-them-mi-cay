import { describe, expect, it } from "vitest";
import {
  addNoodleExperience,
  didNoodleLevelUp,
  getNoodleLevelProgress,
  maxNoodleExperience,
  removeNoodleExperience,
} from "../shared/noodle-level.js";

const xp = (value: number | string) => BigInt(value);

describe("noodle level progression", () => {
  it("starts at level 0 and requires 100 XP for level 1", () => {
    expect(getNoodleLevelProgress(xp(0))).toMatchObject({
      level: xp(0),
      currentLevelExperience: xp(0),
      experienceForNextLevel: xp(100),
      experienceRemaining: xp(100),
      progressPercent: 0,
    });
    expect(getNoodleLevelProgress(xp(99)).level).toBe(xp(0));
    expect(getNoodleLevelProgress(xp(100))).toMatchObject({
      level: xp(1),
      currentLevelExperience: xp(0),
      experienceForNextLevel: xp(150),
    });
  });

  it("increases each level's XP requirement by a rounded-up 1.5x multiplier", () => {
    expect(getNoodleLevelProgress(xp(249))).toMatchObject({
      level: xp(1),
      currentLevelExperience: xp(149),
      experienceForNextLevel: xp(150),
    });
    expect(getNoodleLevelProgress(xp(250))).toMatchObject({
      level: xp(2),
      currentLevelExperience: xp(0),
      experienceForNextLevel: xp(225),
    });
    expect(getNoodleLevelProgress(xp(812)).level).toBe(xp(3));
    expect(getNoodleLevelProgress(xp(813))).toMatchObject({
      level: xp(4),
      currentLevelExperience: xp(0),
      experienceForNextLevel: xp(507),
    });
  });

  it("uses previous clicks as XP and supports extremely high uncapped levels", () => {
    expect(getNoodleLevelProgress(xp(415))).toMatchObject({
      level: xp(2),
      currentLevelExperience: xp(165),
      experienceForNextLevel: xp(225),
    });
    const progress = getNoodleLevelProgress(xp("1" + "0".repeat(400)));
    expect(progress.level).toBeGreaterThan(xp(2000));
    expect(progress.currentLevelExperience).toBeGreaterThanOrEqual(xp(0));
    expect(progress.currentLevelExperience).toBeLessThan(progress.experienceForNextLevel);
  });

  it("safely treats invalid or negative stored XP as zero", () => {
    expect(getNoodleLevelProgress(xp(-10)).level).toBe(xp(0));
    expect(getNoodleLevelProgress("not-xp")).toMatchObject({
      level: xp(0),
      totalExperience: xp(0),
      experienceForNextLevel: xp(100),
    });
  });

  it("signals a level-up only when a click crosses the next XP threshold", () => {
    expect(didNoodleLevelUp(xp(98), xp(99))).toBe(false);
    expect(didNoodleLevelUp(xp(99), xp(100))).toBe(true);
    expect(didNoodleLevelUp(xp(100), xp(101))).toBe(false);
  });

  it("supports immediate optimistic increments, safe rollback and monotonic reconciliation", () => {
    expect(addNoodleExperience(xp(99))).toBe("100");
    expect(removeNoodleExperience(xp(100))).toBe("99");
    expect(removeNoodleExperience(xp(0))).toBe("0");
    expect(maxNoodleExperience("99", "101", "100")).toBe("101");
  });
});
