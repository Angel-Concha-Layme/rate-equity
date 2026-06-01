"use client";

import { Tooltip } from "./Tooltip";

/** "i" trigger for Tooltip. */
export function InfoDot({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <span
        tabIndex={0}
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-line-strong text-[0.6rem] font-bold text-muted"
      >
        i
      </span>
    </Tooltip>
  );
}
