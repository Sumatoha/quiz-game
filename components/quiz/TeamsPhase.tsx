"use client";
import { useState } from "react";
import { C } from "@/lib/constants";
import type { Team } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface TeamsPhaseProps {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  onBack: () => void;
  onStart: () => void;
}

export function TeamsPhase({ teams, setTeams, onBack, onStart }: TeamsPhaseProps) {
  const [name, setName] = useState("");

  const addTeam = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const color = C.teams[teams.length % C.teams.length];
    setTeams([...teams, { id: uid(), name: trimmed, score: 0, color }]);
    setName("");
  };

  const removeTeam = (id: string) => setTeams(teams.filter((t) => t.id !== id));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-block",
            background: C.pink,
            border: `3px solid ${C.ink}`,
            borderRadius: 14,
            padding: "4px 16px",
            marginBottom: 12,
            boxShadow: `3px 3px 0 ${C.ink}`,
            fontSize: 12,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "0.08em",
          }}
        >
          ШАГ 2 / 2
        </div>
        <h1
          style={{
            fontSize: 42,
            fontFamily: "'Fraunces', serif",
            fontWeight: 900,
            color: C.ink,
            margin: "0 0 4px",
          }}
        >
          Команды 🎯
        </h1>
        <p style={{ color: C.inkMuted, fontSize: 15 }}>Минимум две для начала</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Input
          value={name}
          onChange={setName}
          placeholder="Название команды"
          onKeyDown={(e) => {
            if (e.key === "Enter") addTeam();
          }}
          style={{ background: C.white }}
        />
        <Button color={C.mint} onClick={addTeam} disabled={!name.trim()}>
          +
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
        {teams.map((team, i) => (
          <div
            key={team.id}
            className="pop-card"
            style={{
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: `slideUp 0.2s ease ${i * 0.04}s both`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: team.color,
                border: `3px solid ${C.ink}`,
                boxShadow: `2px 2px 0 ${C.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              {i + 1}
            </div>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 16, color: C.ink }}>
              {team.name}
            </span>
            <button
              type="button"
              onClick={() => removeTeam(team.id)}
              style={{
                background: C.cream,
                border: `2px solid ${C.inkPale}`,
                borderRadius: 8,
                color: C.inkMuted,
                cursor: "pointer",
                fontSize: 13,
                padding: "3px 8px",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {teams.length === 0 && (
          <div style={{ textAlign: "center", padding: 36, color: C.inkLight, fontSize: 14 }}>
            Добавь команды 👆
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          color={C.cream}
          textColor={C.ink}
          onClick={onBack}
          style={{ boxShadow: "none", border: `2px solid ${C.inkPale}` }}
        >
          ← Назад
        </Button>
        <Button
          color={C.yellow}
          textColor={C.ink}
          onClick={onStart}
          disabled={teams.length < 2}
        >
          Начать игру ⚡
        </Button>
      </div>
    </div>
  );
}
