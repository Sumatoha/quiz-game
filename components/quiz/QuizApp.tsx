"use client";
import { useState } from "react";
import type { Phase, Round, Team } from "@/lib/types";
import { makeEmptyRound } from "@/lib/utils";
import { GamePhase } from "./GamePhase";
import { ResultsPhase } from "./ResultsPhase";
import { SetupPhase } from "./SetupPhase";
import { TeamsPhase } from "./TeamsPhase";

export function QuizApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [rounds, setRounds] = useState<Round[]>(() => [makeEmptyRound(0)]);
  const [teams, setTeams] = useState<Team[]>([]);

  const restart = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
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
