"use client";
import { useEffect, useRef, useState } from "react";
import type { Phase, Round, Team } from "@/lib/types";
import { makeEmptyRound } from "@/lib/utils";
import { loadState, saveState, type PersistedState } from "@/lib/storage";
import { GamePhase } from "./GamePhase";
import { ResultsPhase } from "./ResultsPhase";
import { SetupPhase } from "./SetupPhase";
import { TeamsPhase } from "./TeamsPhase";

const initialRounds: Round[] = [makeEmptyRound(0)];

export function QuizApp() {
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [teams, setTeams] = useState<Team[]>([]);
  const [curRound, setCurRound] = useState(0);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [turn, setTurn] = useState(0);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPhase(saved.phase);
      setRounds(saved.rounds);
      setTeams(saved.teams);
      setCurRound(saved.game.curRound);
      setAnswered(new Set(saved.game.answered));
      setTurn(saved.game.turn);
    }
    setHydrated(true);
  }, []);

  // Persist on any change, but only after hydration to avoid overwriting.
  const skipNext = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const snapshot: PersistedState = {
      phase,
      rounds,
      teams,
      game: {
        curRound,
        answered: Array.from(answered),
        turn,
      },
    };
    saveState(snapshot);
  }, [hydrated, phase, rounds, teams, curRound, answered, turn]);

  const restart = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCurRound(0);
    setAnswered(new Set());
    setTurn(0);
    setPhase("setup");
  };

  const resetAll = () => {
    setRounds([makeEmptyRound(0)]);
    setTeams([]);
    setCurRound(0);
    setAnswered(new Set());
    setTurn(0);
    setPhase("setup");
  };

  return (
    <div className="quiz-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="quiz-content">
        {phase === "setup" && (
          <SetupPhase
            rounds={rounds}
            setRounds={setRounds}
            onNext={() => setPhase("teams")}
            onResetAll={resetAll}
          />
        )}
        {phase === "teams" && (
          <TeamsPhase
            teams={teams}
            setTeams={setTeams}
            onBack={() => setPhase("setup")}
            onStart={() => setPhase("game")}
          />
        )}
        {phase === "game" && (
          <GamePhase
            rounds={rounds}
            teams={teams}
            setTeams={setTeams}
            curRound={curRound}
            setCurRound={setCurRound}
            answered={answered}
            setAnswered={setAnswered}
            turn={turn}
            setTurn={setTurn}
            onFinish={() => setPhase("results")}
          />
        )}
        {phase === "results" && (
          <ResultsPhase teams={teams} onRestart={restart} />
        )}
      </div>
    </div>
  );
}
