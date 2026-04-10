"use client";
import { C } from "@/lib/constants";

interface TimerRingProps {
  seconds: number;
  maxSeconds: number;
}

export function TimerRing({ seconds, maxSeconds }: TimerRingProps) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / maxSeconds));
  const color = seconds <= 5 ? C.danger : seconds <= 15 ? C.orange : C.blue;
  const danger = seconds <= 5;

  return (
    <div
      style={{
        position: "relative",
        width: 124,
        height: 124,
        animation: danger ? "shake 0.35s ease infinite" : "none",
      }}
    >
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke={`${C.inkPale}40`}
          strokeWidth="8"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.4s linear, stroke 0.3s",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 44,
            fontWeight: 900,
            color,
            animation: danger ? "pulse 0.4s ease infinite" : "none",
          }}
        >
          {Math.max(0, seconds)}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: C.inkLight,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginTop: -4,
          }}
        >
          СЕК
        </span>
      </div>
    </div>
  );
}
