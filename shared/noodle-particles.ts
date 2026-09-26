export const NOODLE_BOWL_EMOJI = "🍜";

export function interleaveNoodleAndTopping(toppingEmoji: string, count: number): string[] {
  const particleCount = Math.max(0, Math.floor(count));
  return Array.from({ length: particleCount }, (_, index) =>
    index % 2 === 0 ? NOODLE_BOWL_EMOJI : toppingEmoji,
  );
}
