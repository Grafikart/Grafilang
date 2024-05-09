import { PlayIcon, SubmitIcon } from "./Icons.tsx";
import { runCode } from "../signals/editor.ts";

export function Actions() {
  return (
    <div className="actions">
      <button onClick={runCode} type="button">
        <PlayIcon />
        Exécuter
      </button>
      <button type="button">
        <SubmitIcon />
        Soumettre
      </button>
    </div>
  );
}
