export type LeaderboardBoard = "total" | "beef" | "chicken" | "octopus";

export type LeaderboardSelectionAction =
  | { type: "select"; board: LeaderboardBoard }
  | { type: "refresh" };

export function leaderboardSelectionReducer(
  currentBoard: LeaderboardBoard,
  action: LeaderboardSelectionAction,
): LeaderboardBoard {
  if (action.type === "select") return action.board;
  return currentBoard;
}
