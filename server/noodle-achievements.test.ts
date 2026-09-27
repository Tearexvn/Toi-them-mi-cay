import { describe, expect, it } from "vitest";
import {
  ANTI_CLICK_ACHIEVEMENT,
  BURNED_FINGER_ACHIEVEMENT,
  getAchievementPanelState,
  getSecretHoldProgress,
  getUnlockedAchievements,
  isSecretHoldComplete,
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
    expect(ANTI_CLICK_ACHIEVEMENT.title).toBe("Nhịp máy căng quá!");
    expect(ANTI_CLICK_ACHIEVEMENT.description).toBe("Nghẹn mì cay rồi, chậm lại tí!");
  });

  it("shows both secret achievements when both have been earned", () => {
    expect(getUnlockedAchievements(true, true)).toEqual([
      BURNED_FINGER_ACHIEVEMENT,
      ANTI_CLICK_ACHIEVEMENT,
    ]);
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
