"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const GAP = 6; // gap between the trigger and the popup (px)
const MARGIN = 8; // minimum margin from the viewport edge (px)

export interface ListboxCoords {
  top: number;
  left: number;
  width: number;
}

/**
 * Accessible listbox logic (open/close, arrow navigation, Enter, Home/End,
 * Escape, click-outside) shared by Dropdown and FlagSelect.
 *
 * The popup is rendered in a portal over `document.body` (hence `popupRef` and
 * `coords`): this escapes the sidebar's `overflow` and the paint order of
 * positioned siblings (e.g. the toggles), without resorting to z-index.
 */
export function useListbox<T extends string>(
  options: { value: T; disabled?: boolean }[],
  value: T,
  onChange: (v: T) => void,
) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [coords, setCoords] = useState<ListboxCoords | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLUListElement>(null);

  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const reposition = useCallback(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const popupH = popupRef.current?.offsetHeight ?? 0;
    const vh = document.documentElement.clientHeight;
    const below = r.bottom + GAP;
    // Below by default; if it does not fit and fits above, it flips upward.
    const fitsBelow = below + popupH <= vh - MARGIN;
    const top = !fitsBelow && r.top - GAP - popupH >= MARGIN ? r.top - GAP - popupH : below;
    setCoords({ top, left: r.left, width: r.width });
  }, []);

  const openMenu = () => {
    const sel = options.findIndex((o) => o.value === value);
    setHi(sel >= 0 && !options[sel].disabled ? sel : enabled.length ? enabled[0] : 0);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const toggle = () => (open ? close() : openMenu());
  const select = (i: number) => {
    const o = options[i];
    if (o && !o.disabled) {
      onChange(o.value);
      close();
    }
  };
  const move = (dir: 1 | -1) => {
    if (!enabled.length) return;
    const pos = enabled.indexOf(hi);
    const nextPos = pos < 0 ? 0 : (pos + dir + enabled.length) % enabled.length;
    setHi(enabled[nextPos]);
  };

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || popupRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onReposition = () => reposition();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, reposition]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open) move(1);
      else openMenu();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) move(-1);
      else openMenu();
    } else if (open && e.key === "Home") {
      e.preventDefault();
      setHi(enabled[0]);
    } else if (open && e.key === "End") {
      e.preventDefault();
      setHi(enabled[enabled.length - 1]);
    } else if (open && e.key === "Enter") {
      e.preventDefault();
      select(hi);
    }
  };

  return { open, hi, ref, popupRef, coords, toggle, select, onKeyDown };
}
