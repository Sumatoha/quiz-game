"use client";
import { C } from "@/lib/constants";
import type { Team } from "@/lib/types";

interface ScoreboardProps {
  teams: Team[];
  activeTeamId: string;
}

export function Scoreboard({ teams, activeTeamId }: ScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 8px",
        background: C.white,
        borderRadius: 14,
        border: `2px solid ${C.inkPale}30`,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {sorted.map((team, i) => {
        const active = team.id === activeTeamId;
        return (
          <div
            key={team.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 10,
              background: active ? `${team.color}12` : "transparent",
              border: active
                ? `2px solid ${team.color}30`
                : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: team.color,
                boxShadow: active ? `0 0 8px ${team.color}` : "none",
              }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: 13,
                color: active ? team.color : C.ink,
              }}
            >
              {team.name}
            </span>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: 15,
                color: i === 0 ? C.orange : C.inkMuted,
              }}
            >
              {team.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
