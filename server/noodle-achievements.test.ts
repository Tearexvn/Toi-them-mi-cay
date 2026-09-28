import { describe, expect, it } from "vitest";
import {
  advanceRobotConfession,
  ANTI_CLICK_ACHIEVEMENT,
  BURNED_FINGER_ACHIEVEMENT,
  getNextVietnamMidnight,
  getAchievementPanelState,
  getSecretHoldProgress,
  getUnlockedAchievements,
  isSecretHoldComplete,
  ROBOT_EATER_ACHIEVEMENT,
  ROBOT_CONFESSION_TAPS_REQUIRED,
  SECRET_HOLD_DURATION_MS,
} from "../shared/noodle-achievements";

describe("achievement panel state", () => {
  it("keeps the secret achievement completely absent until unlocked", () => {
    const achievements = getUnlockedAchievements(false);
    expect(achievements).toEqual([]);
    expect(getAchievementPanelState(achievements)).toBe("empty");
  });

  it("shows the named secret achievement only after the player earns it", () => {
    const achievements = getUnlockedAchievements(true);
    expect(achievements).toEqual([BURNED_FINGER_ACHIEVEMENT]);
    expect(achievements[0]?.title).toBe("Bỏng tay chưa?");
    expect(achievements[0]?.description).toBe("Đau sao không buông?");
    expect(getAchievementPanelState(achievements)).toBe("list");
  });

  it("keeps the anti-click achievement hidden until a suspicious click is detected", () => {
    expect(getUnlockedAchievements(false, false)).toEqual([]);
    expect(getUnlockedAchievements(false, true)).toEqual([ANTI_CLICK_ACHIEVEMENT]);
    expect(ANTI_CLICK_ACHIEVEMENT.title).toBe("Nghẹn mất rồi");
    expect(ANTI_CLICK_ACHIEVEMENT.description).toBe("nghẹn mì cay rồi chậm lại tí!");
  });

  it("reveals the robot-eater achievement only after confession taps are accepted", () => {
    expect(getUnlockedAchievements(false, false, false)).toEqual([]);
    expect(getUnlockedAchievements(false, false, true)).toEqual([ROBOT_EATER_ACHIEVEMENT]);
    expect(ROBOT_EATER_ACHIEVEMENT.title).toBe("robot ăn mì");
  });

  it("shows both secret achievements when both have been earned", () => {
    expect(getUnlockedAchievements(true, true)).toEqual([
      BURNED_FINGER_ACHIEVEMENT,
      ANTI_CLICK_ACHIEVEMENT,
    ]);
  });

  it("sets the temporary robot badge deadline to midnight in Vietnam time", () => {
    const beforeMidnightVietnam = Date.parse("2026-09-27T16:59:00.000Z");
    expect(getNextVietnamMidnight(beforeMidnightVietnam)).toBe(Date.parse("2026-09-27T17:00:00.000Z"));
    expect(getNextVietnamMidnight(Date.parse("2026-09-27T17:00:00.000Z"))).toBe(Date.parse("2026-09-28T17:00:00.000Z"));
  });

  it("requires ten confession taps, then unlocks permanently and sets an expiring icon", () => {
    const now = Date.parse("2026-09-27T16:59:00.000Z");
    let progress = advanceRobotConfession(0, false, now);
    for (let tap = 2; tap < ROBOT_CONFESSION_TAPS_REQUIRED; tap += 1) {
      progress = advanceRobotConfession(progress.confessionCount, progress.unlocked, now);
    }
    expect(progress.confessionCount).toBe(ROBOT_CONFESSION_TAPS_REQUIRED - 1);
    expect(progress.newlyUnlocked).toBe(false);

    const unlocked = advanceRobotConfession(progress.confessionCount, false, now);
    expect(unlocked.confessionCount).toBe(0);
    expect(unlocked.unlocked).toBe(true);
    expect(unlocked.newlyUnlocked).toBe(true);
    expect(unlocked.robotIconExpiresAt).toBe(Date.parse("2026-09-27T17:00:00.000Z"));

    const repeated = advanceRobotConfession(ROBOT_CONFESSION_TAPS_REQUIRED - 1, true, now);
    expect(repeated.newlyUnlocked).toBe(false);
    expect(repeated.robotIconExpiresAt).toBe(unlocked.robotIconExpiresAt);
  });
});

describe("secret hold progress", () => {
  it("grows from zero to complete over ten seconds and stays capped", () => {
    expect(getSecretHoldProgress(0)).toBe(0);
    expect(getSecretHoldProgress(5_000)).toBe(0.5);
    expect(getSecretHoldProgress(SECRET_HOLD_DURATION_MS)).toBe(1);
    expect(getSecretHoldProgress(SECRET_HOLD_DURATION_MS + 5_000)).toBe(1);
  });

  it("does not trigger before ten seconds", () => {
    expect(isSecretHoldComplete(SECRET_HOLD_DURATION_MS - 1)).toBe(false);
    expect(isSecretHoldComplete(SECRET_HOLD_DURATION_MS)).toBe(true);
  });
});
