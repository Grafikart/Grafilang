import { Popover } from "@base-ui/react/popover";
import { AlertCircle, ChevronUp, TerminalSquare, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  closeOutput,
  openOutput,
  useError,
  useOutput,
  useOutputOpen,
} from "../signals/editor.ts";

export function Output() {
  const output = useOutput();
  const error = useError();
  const isOpen = useOutputOpen();
  const statusLabel = error ? "Erreur" : "Console";

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) {
          openOutput();
          return;
        }

        closeOutput();
      }}
      open={isOpen}
    >
      <div className="fixed right-4 bottom-4 z-50 flex items-end justify-end sm:right-6 sm:bottom-6">
        <Popover.Trigger
          className={cn(
            buttonVariants({
              size: "lg",
              variant: error ? "destructive" : "outline",
            }),
            "h-12 rounded-2xl border-border/80 bg-card/95 px-4 text-foreground shadow-2xl shadow-black/30 backdrop-blur supports-[backdrop-filter]:bg-card/85",
          )}
        >
          {error ? (
            <AlertCircle className="size-4 text-destructive" />
          ) : (
            <TerminalSquare className="size-4 text-primary" />
          )}
          <span>Sortie</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              error
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/12 text-primary",
            )}
          >
            {statusLabel}
          </span>
          <ChevronUp
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Positioner
          align="end"
          className="z-50 outline-none"
          side="top"
          sideOffset={12}
        >
          <Popover.Popup
            className="outline-none"
            finalFocus={false}
            initialFocus={false}
          >
            <Card className="h-[min(24rem,45vh)] w-[min(32rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] border-border/80 bg-card/95 shadow-2xl shadow-black/35 backdrop-blur sm:w-[28rem]">
              <CardHeader className="border-b border-border/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {error ? (
                        <AlertCircle className="size-4 text-destructive" />
                      ) : (
                        <TerminalSquare className="size-4 text-primary" />
                      )}
                      Sortie
                    </CardTitle>
                    <CardDescription>
                      Exécute ton algorithme pour voir la sortie standard ou les
                      erreurs.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={error ? "destructive" : "secondary"}>
                      {statusLabel}
                    </Badge>
                    <Popover.Close
                      className={cn(
                        buttonVariants({ size: "icon-sm", variant: "ghost" }),
                        "rounded-full",
                      )}
                    >
                      <X className="size-4" />
                    </Popover.Close>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="min-h-0 flex-1">
                <CardContent className="pb-4">
                  <pre className="min-h-[10rem] whitespace-pre-wrap rounded-xl border border-border/60 bg-background/75 p-4 text-xs leading-6 text-foreground">
                    <code>{(error ?? output) || "Aucune sortie pour le moment."}</code>
                  </pre>
                </CardContent>
              </ScrollArea>
            </Card>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
