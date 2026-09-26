export type NoodleAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const SECRET_HOLD_DURATION_MS = 10_000;

// Not included in the general achievement catalog: this stays hidden until earned.
export const BURNED_FINGER_ACHIEVEMENT: NoodleAchievement = {
  id: "burned-finger",
  title: "Bỏng tay chưa?",
  description: "Một cơn thèm nóng đến mức khó quên.",
  icon: "🔥",
};

export const NOODLE_ACHIEVEMENTS: readonly NoodleAchievement[] = [];

export function getUnlockedAchievements(hasBurnedFinger: boolean): readonly NoodleAchievement[] {
  return hasBurnedFinger ? [BURNED_FINGER_ACHIEVEMENT] : [];
}

export function getSecretHoldProgress(elapsedMs: number) {
  return Math.max(0, Math.min(1, elapsedMs / SECRET_HOLD_DURATION_MS));
}

export function isSecretHoldComplete(elapsedMs: number) {
  return elapsedMs >= SECRET_HOLD_DURATION_MS;
}

export function getAchievementPanelState(achievements: readonly NoodleAchievement[]) {
  return achievements.length > 0 ? "list" : "empty";
}
