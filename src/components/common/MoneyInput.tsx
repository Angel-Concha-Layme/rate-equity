"use client";

import { useState } from "react";
import { Input } from "./Input";

const formatDisplay = (n: number) =>
  n.toLocaleString("es-PE", { maximumFractionDigits: 2 });

// Keep digits plus a single decimal separator (comma or period) while typing.
const sanitize = (raw: string) => {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  const firstSep = cleaned.search(/[.,]/);
  if (firstSep === -1) return cleaned;
  const head = cleaned.slice(0, firstSep + 1);
  const decimals = cleaned.slice(firstSep + 1).replace(/[.,]/g, "");
  return head + decimals;
};

const toNumber = (text: string) => {
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

type MoneyInputProps = {
  value: number;
  onChange: (n: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function MoneyInput({ value, onChange, ...props }: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const display = focused ? draft : value ? formatDisplay(value) : "";

  return (
    <Input
      inputMode="decimal"
      {...props}
      value={display}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value ? String(value).replace(".", ",") : "");
        props.onFocus?.(e);
      }}
      onChange={(e) => {
        const text = sanitize(e.target.value);
        setDraft(text);
        onChange(toNumber(text));
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}
