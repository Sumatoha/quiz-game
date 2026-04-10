"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { C } from "@/lib/constants";
import type { Question, Team } from "@/lib/types";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";
import { TimerRing } from "./TimerRing";

interface QuestionModalProps {
  question: Question;
  teams: Team[];
  activeTeam: Team;
  onDone: (teamId: string | null, points: number) => void;
  onClose: () => void;
}

type Phase = "question" | "passed" | "answer" | "done";

const MAIN_SECONDS = 60;
const PASS_SECONDS = 20;

export function QuestionModal({
  question,
  teams,
  activeTeam,
  onDone,
  onClose,
}: QuestionModalProps) {
  const [phase, setPhase] = useState<Phase>("question");
  const [seconds, setSeconds] = useState(MAIN_SECONDS);
  const [passedTo, setPassedTo] = useState<Team | null>(null);
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (sec: number, onEnd: () => void) => {
      stopTimer();
      let t = sec;
      setSeconds(t);
      timerRef.current = setInterval(() => {
        t -= 1;
        setSeconds(t);
        if (t <= 0) {
          stopTimer();
          onEnd();
        }
      }, 1000);
    },
    [stopTimer],
  );

  useEffect(() => {
    startTimer(MAIN_SECONDS, () => {
      const others = teams.filter((t) => t.id !== activeTeam.id);
      if (others.length > 0) {
        setPassedTo(others[0]);
        setPhase("passed");
      } else {
        setPhase("answer");
      }
    });
    return stopTimer;
  }, [startTimer, stopTimer, teams, activeTeam.id]);

  useEffect(() => {
    if (phase === "passed" && passedTo) {
      startTimer(PASS_SECONDS, () => setPhase("answer"));
    }
  }, [phase, passedTo, startTimer]);

  const markCorrect = (teamId: string) => {
    stopTimer();
    onDone(teamId, question.points);
    setPhase("done");
  };

  const handlePass = () => {
    stopTimer();
    const others = teams.filter((t) => t.id !== activeTeam.id);
    if (others.length > 0) {
      setPassedTo(others[0]);
      setPhase("passed");
    } else {
      setPhase("answer");
    }
  };

  const markNobody = () => {
    stopTimer();
    onDone(null, 0);
    setPhase("done");
  };

  const toggleReveal = () => setRevealed((r) => !r);

  const currentTeam = passedTo || activeTeam;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,46,0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        animation: "fadeIn 0.15s",
      }}
    >
      <div
        className="pop-card"
        style={{
          padding: "28px 32px",
          maxWidth: 560,
          width: "100%",
          animation: "popIn 0.3s",
          borderWidth: 4,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -2,
            left: 20,
            right: 20,
            height: 4,
            background: currentTeam.color,
            borderRadius: "0 0 4px 4px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Tag bg={C.yellowPale} color={C.inkSoft}>
              {question.points} б.
            </Tag>
            <Tag bg={`${currentTeam.color}18`} color={currentTeam.color}>
              {passedTo ? "→ " : ""}
              {currentTeam.name}
            </Tag>
            {passedTo && (
              <Tag bg={C.pinkPale} color={C.pink}>
                20 сек!
              </Tag>
            )}
          </div>
          {phase === "done" && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: C.cream,
                border: `2px solid ${C.inkPale}`,
                borderRadius: 10,
                color: C.ink,
                cursor: "pointer",
                fontSize: 14,
                padding: "4px 10px",
                fontWeight: 800,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1.6,
            marginBottom: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {question.text}
        </p>

        {(phase === "question" || phase === "passed") && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              marginBottom: 16,
            }}
          >
            <TimerRing
              seconds={seconds}
              maxSeconds={passedTo ? PASS_SECONDS : MAIN_SECONDS}
            />

            {revealed && (
              <div
                style={{
                  width: "100%",
                  background: C.mintPale,
                  border: `2px solid ${C.mint}35`,
                  borderRadius: 14,
                  padding: "12px 16px",
                  animation: "slideUp 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.mint,
                    marginBottom: 4,
                    letterSpacing: "0.08em",
                  }}
                >
                  ОТВЕТ
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                  {question.answer || "—"}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "question" && (
                <>
                  <Button color={C.mint} onClick={() => markCorrect(activeTeam.id)}>
                    ✓ {activeTeam.name}
                  </Button>
                  <Button
                    color={C.cream}
                    textColor={C.ink}
                    onClick={handlePass}
                    style={{ boxShadow: "none", border: `2px solid ${C.inkPale}` }}
                  >
                    Не знают →
                  </Button>
                </>
              )}
              {phase === "passed" && passedTo && (
                <>
                  <Button color={C.mint} onClick={() => markCorrect(passedTo.id)}>
                    ✓ {passedTo.name}
                  </Button>
                  <Button
                    color={C.cream}
                    textColor={C.ink}
                    onClick={markNobody}
                    style={{ boxShadow: "none", border: `2px solid ${C.inkPale}` }}
                  >
                    Тоже нет
                  </Button>
                </>
              )}
              <Button
                color={revealed ? C.mint : C.cream}
                textColor={revealed ? "#fff" : C.inkMuted}
                small
                onClick={toggleReveal}
                style={
                  revealed
                    ? {}
                    : { boxShadow: "none", border: `2px solid ${C.inkPale}` }
                }
              >
                {revealed ? "🙈 Скрыть ответ" : "👁 Показать ответ"}
              </Button>
            </div>
          </div>
        )}

        {(phase === "answer" || phase === "done") && (
          <div style={{ animation: "slideUp 0.2s" }}>
            <div
              style={{
                background: C.mintPale,
                border: `2px solid ${C.mint}35`,
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.mint,
                  marginBottom: 4,
                  letterSpacing: "0.08em",
                }}
              >
                ОТВЕТ
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>
                {question.answer || "—"}
              </div>
            </div>
            {phase === "answer" && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: C.inkMuted,
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  Кто ответил правильно?
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {teams.map((team) => (
                    <Button
                      key={team.id}
                      color={team.color}
                      onClick={() => markCorrect(team.id)}
                    >
                      {team.name}
                    </Button>
                  ))}
                  <Button
                    color={C.cream}
                    textColor={C.ink}
                    onClick={markNobody}
                    style={{ boxShadow: "none", border: `2px solid ${C.inkPale}` }}
                  >
                    Никто
                  </Button>
                </div>
              </div>
            )}
            {phase === "done" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 0",
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.mint,
                }}
              >
                ✓ Записано — нажми ✕
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
