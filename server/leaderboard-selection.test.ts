import { describe, expect, it } from "vitest";
import { leaderboardSelectionReducer, type LeaderboardBoard } from "../shared/leaderboard-selection";

describe("leaderboard selection", () => {
  it.each<LeaderboardBoard>(["total", "beef", "chicken", "octopus"])(
    "keeps the %s board selected when refreshed",
    (board) => {
      expect(leaderboardSelectionReducer(board, { type: "refresh" })).toBe(board);
    },
  );

  it("changes boards only when the user selects a different tab", () => {
    expect(leaderboardSelectionReducer("total", { type: "select", board: "beef" })).toBe("beef");
  });
});
