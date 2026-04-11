"use client";
import { useMemo, useState } from "react";
import { C, TOPIC_HEADER_COLORS } from "@/lib/constants";
import type { Question, Round, Team } from "@/lib/types";
import { Tag } from "./ui/Tag";
import { Button } from "./ui/Button";
import { QuestionModal } from "./QuestionModal";
import { Scoreboard } from "./Scoreboard";

interface GamePhaseProps {
  rounds: Round[];
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  curRound: number;
  setCurRound: (n: number) => void;
  answered: Set<string>;
  setAnswered: (updater: (prev: Set<string>) => Set<string>) => void;
  turn: number;
  setTurn: (n: number) => void;
  onFinish: () => void;
  onExit: () => void;
}

export function GamePhase({
  rounds,
  teams,
  setTeams,
  curRound,
  setCurRound,
  answered,
  setAnswered,
  turn,
  setTurn,
  onFinish,
  onExit,
}: GamePhaseProps) {
  const [activeQ, setActiveQ] = useState<Question | null>(null);

  const round = rounds[curRound];
  const activeTeam = teams[turn % teams.length];

  const { total, done } = useMemo(() => {
    const t = round.topics.reduce((a, topic) => a + topic.questions.length, 0);
    const d = round.topics.reduce(
      (a, topic) => a + topic.questions.filter((q) => answered.has(q.id)).length,
      0,
    );
    return { total: t, done: d };
  }, [round, answered]);

  const allDone = total > 0 && done === total;
  const isLast = curRound === rounds.length - 1;

  const handleDone = (teamId: string | null, points: number) => {
    if (teamId && points > 0) {
      setTeams(
        teams.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t)),
      );
    }
    if (activeQ) {
      const questionId = activeQ.id;
      setAnswered((prev) => {
        const next = new Set(prev);
        next.add(questionId);
        return next;
      });
    }
  };

  const handleClose = () => {
    setActiveQ(null);
    setTurn(turn + 1);
  };

  const goNextRound = () => {
    setCurRound(curRound + 1);
    setTurn(0);
  };

  const exitGame = () => {
    if (
      window.confirm(
        "Завершить игру и стереть весь квиз? Вопросы, команды и счёт — всё удалится. Вернуться нельзя.",
      )
    ) {
      onExit();
    }
  };

  const skipRound = () => {
    const confirmMsg = isLast
      ? "Завершить последний раунд и перейти к результатам? Вернуться нельзя."
      : "Пропустить текущий раунд и перейти к следующему? Вернуться нельзя.";
    if (!window.confirm(confirmMsg)) return;
    if (isLast) {
      onFinish();
    } else {
      goNextRound();
    }
  };

  const maxQuestions = Math.max(
    0,
    ...round.topics.map((t) => t.questions.length),
  );

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <Tag bg={C.bluePale} color={C.blue}>
              РАУНД {curRound + 1}/{rounds.length}
            </Tag>
            <h2
              style={{
                margin: "6px 0 0",
                fontSize: 30,
                fontFamily: "'Fraunces', serif",
                fontWeight: 900,
                color: C.ink,
              }}
            >
              {round.name}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Tag bg={C.cream} color={C.inkMuted}>
              {done}/{total}
            </Tag>
            <Button
              color={C.cream}
              textColor={C.inkMuted}
              small
              onClick={skipRound}
              style={{ boxShadow: "none", border: `2px solid ${C.inkPale}` }}
            >
              {isLast ? "Завершить →" : "Пропустить раунд →"}
            </Button>
            <Button
              color={C.cream}
              textColor={C.danger}
              small
              onClick={exitGame}
              style={{ boxShadow: "none", border: `2px solid ${C.danger}40` }}
            >
              ✕ Выйти
            </Button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 14,
            background: `${activeTeam.color}10`,
            border: `3px solid ${activeTeam.color}30`,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: activeTeam.color,
              boxShadow: `0 0 10px ${activeTeam.color}60`,
              animation: "pulse 1.5s infinite",
            }}
          />
          <span style={{ fontWeight: 800, fontSize: 15, color: activeTeam.color }}>
            Выбирает: {activeTeam.name}
          </span>
        </div>

        <Scoreboard teams={teams} activeTeamId={activeTeam.id} />
      </div>

      <div style={{ maxWidth: 1000, margin: "16px auto 0" }}>
        <div
          className="responsive-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${round.topics.length}, 1fr)`,
            gap: 8,
            marginBottom: 8,
          }}
        >
          {round.topics.map((topic, ti) => {
            const hc = TOPIC_HEADER_COLORS[ti % TOPIC_HEADER_COLORS.length];
            return (
              <div
                key={topic.id}
                className="pop-card-color"
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  background: hc,
                  boxShadow: `4px 4px 0 ${C.ink}`,
                }}
              >
                {topic.name}
              </div>
            );
          })}
        </div>

        {Array.from({ length: maxQuestions }, (_, i) => (
          <div
            key={i}
            className="responsive-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${round.topics.length}, 1fr)`,
              gap: 8,
              marginBottom: 8,
            }}
          >
            {round.topics.map((topic, ti) => {
              const q = topic.questions[i];
              if (!q) return <div key={`${topic.id}-${i}`} />;
              const d = answered.has(q.id);
              const hc = TOPIC_HEADER_COLORS[ti % TOPIC_HEADER_COLORS.length];
              return (
                <button
                  type="button"
                  key={q.id}
                  className="q-cell"
                  disabled={d}
                  onClick={() => setActiveQ(q)}
                  style={{
                    background: d ? C.creamDark : C.white,
                    border: `3px solid ${d ? `${C.inkPale}40` : C.ink}`,
                    borderRadius: 16,
                    padding: "22px 8px",
                    cursor: d ? "default" : "pointer",
                    opacity: d ? 0.25 : 1,
                    boxShadow: d ? "none" : `4px 4px 0 ${C.ink}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      fontFamily: "'Fraunces', serif",
                      color: d ? C.inkPale : hc,
                    }}
                  >
                    {q.points}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {allDone && (
        <div style={{ textAlign: "center", marginTop: 28, animation: "slideUp 0.3s" }}>
          {isLast ? (
            <Button color={C.yellow} textColor={C.ink} onClick={onFinish}>
              Финиш 🏆
            </Button>
          ) : (
            <Button onClick={goNextRound}>Следующий раунд →</Button>
          )}
        </div>
      )}

      {activeQ && (
        <QuestionModal
          question={activeQ}
          teams={teams}
          activeTeam={activeTeam}
          onDone={handleDone}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
