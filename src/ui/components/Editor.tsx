import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { initializeEditor } from "../signals/editor.ts";

type Props = {
  defaultValue?: string;
  className?: string;
};

export function Editor({ defaultValue, className }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    return initializeEditor(divRef.current, defaultValue);
  }, [defaultValue]);

  return (
    <div
      className={cn(
        "min-h-[26rem] w-full rounded-xl border border-border/60 bg-[#161821]",
        className,
      )}
      ref={divRef}
    />
  );
}
