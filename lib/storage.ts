import type { Phase, Round, Team } from "./types";

const KEY = "quiz-game-state-v1";

export interface PersistedState {
  phase: Phase;
  rounds: Round[];
  teams: Team[];
  game: {
    curRound: number;
    answered: string[];
    turn: number;
  };
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || !Array.isArray(parsed.rounds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or privacy mode — silently ignore.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

