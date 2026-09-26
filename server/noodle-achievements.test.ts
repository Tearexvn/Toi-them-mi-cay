import { describe, expect, it } from "vitest";
import { getAchievementPanelState } from "../shared/noodle-achievements";

describe("achievement panel state", () => {
  it("shows the placeholder while no achievements have been added", () => {
    expect(getAchievementPanelState([])).toBe("empty");
  });

  it("switches to the list state when achievements are added later", () => {
    expect(getAchievementPanelState([
      { id: "first-bowl", title: "Bát mì đầu tiên", description: "Bấm mì lần đầu.", icon: "🍜" },
    ])).toBe("list");
  });
});
