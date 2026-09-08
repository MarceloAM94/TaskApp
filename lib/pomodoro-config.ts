export const FOCUS_MINUTES = 25;
export const SHORT_BREAK_MINUTES = 5;
export const LONG_BREAK_MINUTES = 15;
export const CYCLES_BEFORE_LONG_BREAK = 4;

export const FOCUS_SECONDS = FOCUS_MINUTES * 60;
export const SHORT_BREAK_SECONDS = SHORT_BREAK_MINUTES * 60;
export const LONG_BREAK_SECONDS = LONG_BREAK_MINUTES * 60;

export type PomodoroPhase = "focus" | "short_break" | "long_break";

export function phaseDuration(phase: PomodoroPhase): number {
  switch (phase) {
    case "focus":
      return FOCUS_SECONDS;
    case "short_break":
      return SHORT_BREAK_SECONDS;
    case "long_break":
      return LONG_BREAK_SECONDS;
  }
}

export function breakAfterFocus(completedFocus: number): PomodoroPhase {
  return completedFocus % CYCLES_BEFORE_LONG_BREAK === 0
    ? "long_break"
    : "short_break";
}