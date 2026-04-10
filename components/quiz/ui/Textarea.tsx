"use client";
import { C } from "@/lib/constants";

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: C.cream,
        border: `2px solid ${C.inkPale}`,
        borderRadius: 12,
        padding: "10px 14px",
        color: C.ink,
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 500,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        lineHeight: 1.5,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
      onBlur={(e) => (e.currentTarget.style.borderColor = C.inkPale)}
    />
  );
}
