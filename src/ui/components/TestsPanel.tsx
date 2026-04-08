import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  FlaskConical,
  TerminalSquare,
  XCircle,
} from "lucide-react";

import type { ChallengeDefinition } from "../../type.challenge.ts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TestResult } from "../signals/editor.ts";

type Props = {
  firstFailedTestIndex: number | null;
  results: TestResult[];
  tests: ChallengeDefinition["tests"];
};

function toInlineValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function toCodeBlock(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function toExpectedOutput(value: unknown) {
  return typeof value === "string" ? value : toCodeBlock(value);
}

function getInputLabel(name: string) {
  return name === "ask" ? "Saisie DEMANDER" : name;
}

function renderStatusBadge(result: TestResult | undefined) {
  if (!result || result.status === "idle") {
    return null;
  }

  if (result.status === "success") {
    return (
      <Badge className="bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/12">
        <CheckCircle2 className="size-3.5" />
        Succès
      </Badge>
    );
  }

  return (
    <Badge className="bg-destructive/12 text-destructive hover:bg-destructive/12">
      <XCircle className="size-3.5" />
      Échec
    </Badge>
  );
}

export function TestsPanel({ firstFailedTestIndex, results, tests }: Props) {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setOpenItems({});
  }, [tests]);

  useEffect(() => {
    if (firstFailedTestIndex === null) {
      return;
    }

    setOpenItems((current) => ({
      ...current,
      [firstFailedTestIndex]: true,
    }));

    requestAnimationFrame(() => {
      itemRefs.current[firstFailedTestIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [firstFailedTestIndex]);

  return (
    <Card className="min-h-[18rem] border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" />
              Cas de test
            </CardTitle>
            <CardDescription>
              Les scénarios visibles servent de repères avant la correction
              complète.
            </CardDescription>
          </div>
          <Badge variant="outline">{tests.length} tests</Badge>
        </div>
      </CardHeader>
      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="space-y-3 pb-4">
          {tests.map((test, index) => {
            const result = results[index];
            const isOpen = !!openItems[index];

            return (
              <Collapsible
                className="rounded-xl border border-border/70 bg-background/65"
                key={`${test.title}-${index}`}
                onOpenChange={(open) => {
                  setOpenItems((current) => ({
                    ...current,
                    [index]: open,
                  }));
                }}
                open={isOpen}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
              >
                <CollapsibleTrigger className="p-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {result?.status === "success" ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    ) : result?.status === "failure" ? (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground">
                        {test.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Scénario {index + 1}
                      </p>
                      {result?.status === "failure" && result.message ? (
                        <p className="mt-1 text-xs text-destructive">
                          {result.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {renderStatusBadge(result)}
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsiblePanel className="border-t border-border/60 px-3 pt-3 pb-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        <TerminalSquare className="size-3.5" />
                        Entrée
                      </div>

                      <ul className="space-y-2">
                        {Object.entries(test.in).map(([name, value]) => (
                          <li
                            className="flex items-center gap-2 text-xs"
                            key={name}
                          >
                            <span className="font-mono font-semibold text-foreground">
                              - {getInputLabel(name)} :
                            </span>
                            <span className="min-w-0 rounded-md bg-muted px-2 py-1 font-mono text-muted-foreground break-words">
                              {toInlineValue(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Sortie attendue
                      </div>
                      <div className="space-y-2">
                        {test.out.map((value, outputIndex) => (
                          <pre
                            className="overflow-x-auto rounded-lg border border-border/60 bg-background p-3 text-xs text-foreground"
                            key={`${test.title}-out-${outputIndex}`}
                          >
                            <code>{toExpectedOutput(value)}</code>
                          </pre>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>
              </Collapsible>
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
