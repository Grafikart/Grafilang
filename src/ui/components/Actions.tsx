import { Play, Send } from "lucide-react";

import type { ChallengeDefinition } from "../../type.challenge.ts";
import { Button } from "@/components/ui/button";
import { runCode, submitCode } from "../signals/editor.ts";

type Props = {
  tests: ChallengeDefinition["tests"];
};

export function Actions({ tests }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={runCode} type="button">
        <Play />
        Exécuter
      </Button>
      <Button onClick={() => submitCode(tests)} type="button" variant="outline">
        <Send />
        Soumettre
      </Button>
    </div>
  );
}
