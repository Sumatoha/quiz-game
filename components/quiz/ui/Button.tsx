"use client";
import type { CSSProperties, ReactNode } from "react";
import { C } from "@/lib/constants";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  textColor?: string;
  outline?: boolean;
  small?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
}

export function Button({
  children,
  onClick,
  disabled,
  color = C.blue,
  textColor = "#fff",
  outline,
  small,
  style,
  type = "button",
}: ButtonProps) {
  const bg = outline ? "transparent" : color;
  const fg = outline ? color : textColor;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color: fg,
        border: outline ? `3px solid ${color}` : `3px solid ${C.ink}`,
        padding: small ? "6px 14px" : "10px 22px",
        borderRadius: small ? 12 : 14,
        fontSize: small ? 13 : 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        boxShadow: outline ? "none" : `4px 4px 0px ${C.ink}`,
        transition: "all 0.15s",
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
