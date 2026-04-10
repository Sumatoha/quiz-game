"use client";
import type { CSSProperties, KeyboardEvent } from "react";
import { C } from "@/lib/constants";

interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  type?: "text" | "number";
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function Input({
  value,
  onChange,
  placeholder,
  style,
  type = "text",
  onKeyDown,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      style={{
        background: C.cream,
        border: `2px solid ${C.inkPale}`,
        borderRadius: 12,
        padding: "10px 14px",
        color: C.ink,
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
        ...style,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
      onBlur={(e) => (e.currentTarget.style.borderColor = C.inkPale)}
    />
  );
}
