export type NoodleAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// Deliberately empty for now; achievement definitions can be added later.
export const NOODLE_ACHIEVEMENTS: readonly NoodleAchievement[] = [];

export function getAchievementPanelState(achievements: readonly NoodleAchievement[]) {
  return achievements.length > 0 ? "list" : "empty";
}
