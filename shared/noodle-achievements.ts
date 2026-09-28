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
  description: "Đau sao không buông?",
  icon: "🔥",
};

export const ANTI_CLICK_ACHIEVEMENT: NoodleAchievement = {
  id: "anti-click",
  title: "Nghẹn mất rồi",
  description: "nghẹn mì cay rồi chậm lại tí!",
  icon: "🤖",
};

export const ROBOT_EATER_ACHIEVEMENT: NoodleAchievement = {
  id: "robot-eater",
  title: "robot ăn mì",
  description: "Tự nhận mình là robot và vẫn cố bấm tiếp.",
  icon: "🤖",
};

export const ROBOT_CONFESSION_TAPS_REQUIRED = 10;

const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1_000;

export function getNextVietnamMidnight(now: number = Date.now()): number {
  const vietnamNow = new Date(now + VIETNAM_UTC_OFFSET_MS);
  const nextVietnamMidnightAsUtc = Date.UTC(
    vietnamNow.getUTCFullYear(),
    vietnamNow.getUTCMonth(),
    vietnamNow.getUTCDate() + 1,
  );
  return nextVietnamMidnightAsUtc - VIETNAM_UTC_OFFSET_MS;
}

export function advanceRobotConfession(
  currentCount: number,
  alreadyUnlocked: boolean,
  now: number = Date.now(),
) {
  const nextCount = Math.max(0, Math.trunc(currentCount)) + 1;
  if (nextCount < ROBOT_CONFESSION_TAPS_REQUIRED) {
    return {
      confessionCount: nextCount,
      unlocked: false,
      newlyUnlocked: false,
      robotIconExpiresAt: null,
    } as const;
  }
  return {
    confessionCount: 0,
    unlocked: true,
    newlyUnlocked: !alreadyUnlocked,
    robotIconExpiresAt: getNextVietnamMidnight(now),
  } as const;
}

export const NOODLE_ACHIEVEMENTS: readonly NoodleAchievement[] = [];

export function getUnlockedAchievements(
  hasBurnedFinger: boolean,
  hasAntiClickAchievement = false,
  hasRobotEaterAchievement = false,
): readonly NoodleAchievement[] {
  return [
    ...(hasBurnedFinger ? [BURNED_FINGER_ACHIEVEMENT] : []),
    ...(hasAntiClickAchievement ? [ANTI_CLICK_ACHIEVEMENT] : []),
    ...(hasRobotEaterAchievement ? [ROBOT_EATER_ACHIEVEMENT] : []),
  ];
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
