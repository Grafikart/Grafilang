import { useEffect, useRef } from "react";
import { Card } from "./Card.tsx";
import { initializeEditor } from "../signals/editor.ts";

type Props = {
  defaultValue?: string;
};

export function Editor({ defaultValue }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeEditor(divRef.current!, defaultValue);
  }, []);

  return <Card className="editor" divRef={divRef} />;
}
