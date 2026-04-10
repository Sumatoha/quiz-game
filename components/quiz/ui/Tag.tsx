"use client";
import type { ReactNode } from "react";
import { C } from "@/lib/constants";

interface TagProps {
  children: ReactNode;
  bg?: string;
  color?: string;
}

export function Tag({ children, bg = C.bluePale, color = C.blue }: TagProps) {
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: "0.02em",
        border: `2px solid ${color}30`,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
}
