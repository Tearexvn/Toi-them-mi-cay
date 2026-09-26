const ZERO = BigInt(0);
const ONE = BigInt(1);
const FIRST_LEVEL_XP = BigInt(100);
const ONE_HUNDREDTH_PERCENT = BigInt(10_000);
const THREE = BigInt(3);
const TWO = BigInt(2);

export type NoodleLevelProgress = {
  level: bigint;
  totalExperience: bigint;
  currentLevelExperience: bigint;
  experienceForNextLevel: bigint;
  experienceRemaining: bigint;
  progressPercent: number;
};

/**
 * Each level needs ceil(previous threshold × 1.5) XP.
 * Level 0 → 1 starts at 100 XP; the loop deliberately has no level cap.
 */
export function getNoodleLevelProgress(experience: bigint | number | string): NoodleLevelProgress {
  let totalExperience: bigint;
  try {
    totalExperience = typeof experience === "bigint" ? experience : BigInt(experience);
  } catch {
    totalExperience = ZERO;
  }
  if (totalExperience < ZERO) totalExperience = ZERO;

  let remainingExperience = totalExperience;
  let level = ZERO;
  let experienceForNextLevel = FIRST_LEVEL_XP;

  while (remainingExperience >= experienceForNextLevel) {
    remainingExperience -= experienceForNextLevel;
    level += ONE;
    experienceForNextLevel = (experienceForNextLevel * THREE + ONE) / TWO;
  }

  const progressPercent = Number((remainingExperience * ONE_HUNDREDTH_PERCENT) / experienceForNextLevel) / 100;
  return {
    level,
    totalExperience,
    currentLevelExperience: remainingExperience,
    experienceForNextLevel,
    experienceRemaining: experienceForNextLevel - remainingExperience,
    progressPercent: Math.min(100, progressPercent),
  };
}

export function didNoodleLevelUp(
  previousExperience: bigint | number | string,
  nextExperience: bigint | number | string,
) {
  return getNoodleLevelProgress(nextExperience).level > getNoodleLevelProgress(previousExperience).level;
}

export function addNoodleExperience(experience: bigint | number | string) {
  return (getNoodleLevelProgress(experience).totalExperience + ONE).toString();
}

export function removeNoodleExperience(experience: bigint | number | string) {
  const total = getNoodleLevelProgress(experience).totalExperience;
  return (total > ZERO ? total - ONE : ZERO).toString();
}

export function maxNoodleExperience(...values: Array<bigint | number | string>) {
  return values.reduce<bigint>((highest, value) => {
    const parsed = getNoodleLevelProgress(value).totalExperience;
    return parsed > highest ? parsed : highest;
  }, ZERO).toString();
}
