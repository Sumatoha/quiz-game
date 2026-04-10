"use client";
import { C } from "@/lib/constants";
import type { Team } from "@/lib/types";
import { Button } from "./ui/Button";

interface ResultsPhaseProps {
  teams: Team[];
  onRestart: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function ResultsPhase({ teams, onRestart }: ResultsPhaseProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const podiumColors = [C.yellow, C.inkLight, C.orange];

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: "60px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          animation: "float 2.5s ease infinite",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: C.yellowPale,
            border: `4px solid ${C.ink}`,
            boxShadow: `6px 6px 0 ${C.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 52 }}>🏆</span>
        </div>
      </div>
      <h1
        style={{
          fontSize: 42,
          fontFamily: "'Fraunces', serif",
          fontWeight: 900,
          color: C.ink,
          margin: "8px 0 4px",
        }}
      >
        {sorted[0]?.name}
      </h1>
      <p style={{ color: C.inkMuted, fontSize: 15, marginBottom: 32 }}>
        Победа! 🎉
      </p>
      {sorted.map((team, i) => (
        <div
          key={team.id}
          className="pop-card"
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
            animation: `slideUp 0.3s ease ${i * 0.06}s both`,
            borderColor: i === 0 ? C.yellow : C.ink,
            boxShadow: i === 0 ? `6px 6px 0 ${C.yellow}` : `4px 4px 0 ${C.ink}`,
            background: i === 0 ? C.yellowPale : C.white,
          }}
        >
          <span style={{ fontSize: 28, width: 36, textAlign: "center" }}>
            {MEDALS[i] || `${i + 1}`}
          </span>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: team.color,
              border: `2px solid ${C.ink}`,
            }}
          />
          <span
            style={{
              flex: 1,
              textAlign: "left",
              fontWeight: 800,
              fontSize: 17,
              color: C.ink,
            }}
          >
            {team.name}
          </span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26,
              fontWeight: 900,
              color: podiumColors[i] || C.inkMuted,
            }}
          >
            {team.score}
          </span>
        </div>
      ))}
      <Button color={C.blue} onClick={onRestart} style={{ marginTop: 28 }}>
        Новая игра 🔄
      </Button>
    </div>
  );
}
