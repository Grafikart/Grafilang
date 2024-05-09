import { Card } from "./Card.tsx";
import { OutputIcon } from "./Icons.tsx";
import { useError, useOutput } from "../signals/editor.ts";

export function Output() {
  const output = useOutput();
  const error = useError();
  console.log("reRender");
  return (
    <Card
      padded
      title={
        <>
          <OutputIcon size={20} /> Sortie
        </>
      }
    >
      <pre>
        <code>{error ?? output}</code>
      </pre>
    </Card>
  );
}
