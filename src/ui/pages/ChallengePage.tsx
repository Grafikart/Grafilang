import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpenText, Code2 } from "lucide-react";

import { challengeRoute } from "../routes.tsx";
import { Actions } from "../components/Actions.tsx";
import { Editor } from "../components/Editor.tsx";
import { Markdown } from "../components/Markdown.tsx";
import { Output } from "../components/Output.tsx";
import { TestsPanel } from "../components/TestsPanel.tsx";
import {
  closeSuccessDialog,
  setChallengeTests,
  useFirstFailedTestIndex,
  useSuccessDialogOpen,
  useTestResults,
} from "../signals/editor.ts";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ChallengePage() {
  const { description, code, tests } = challengeRoute.useLoaderData();
  const testResults = useTestResults();
  const firstFailedTestIndex = useFirstFailedTestIndex();
  const successDialogOpen = useSuccessDialogOpen();

  useEffect(() => {
    setChallengeTests(tests);
  }, [tests]);

  return (
    <>
      <main className="grid flex-1 gap-4 xl:grid-cols-2 p-4 h-screen">
        <ScrollArea className="overflow-auto h-full">
          <div className="grid gap-4">
            <Card className="flex-none h-auto">
              <CardHeader className="border-b border-border/70">
                <CardTitle className="flex items-center gap-2">
                  <BookOpenText className="size-4 text-primary" />
                  Consigne
                </CardTitle>
                <CardDescription>
                  Objectifs, contraintes et détails de l&apos;exercice.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <Markdown>{description}</Markdown>
              </CardContent>
            </Card>
            <TestsPanel
              firstFailedTestIndex={firstFailedTestIndex}
              results={testResults}
              tests={tests}
            />
          </div>
        </ScrollArea>

        <Card className="gap-0 p-0 h-full overflow-hidden">
          <CardHeader className="mb-0 p-4">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="size-4 text-primary" />
              Éditeur
            </CardTitle>
            <CardDescription>
              Rédige puis exécute ton algorithme dans l&apos;atelier central.
            </CardDescription>
            <CardAction>
              <Actions tests={tests} />
            </CardAction>
          </CardHeader>
          <CardContent className="min-h-0 h-full flex-1 p-0 grid">
            <Editor className="h-full" defaultValue={code} />
          </CardContent>
        </Card>
      </main>
      <Output />
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeSuccessDialog();
          }
        }}
        open={successDialogOpen}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <div className="space-y-5">
              <div className="space-y-2">
                <DialogTitle>Bravo, tous les tests passent.</DialogTitle>
                <DialogDescription>
                  Ton algorithme valide l&apos;ensemble des cas de test de cet
                  exercice.
                </DialogDescription>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <DialogClose
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-2xl",
                  )}
                >
                  Fermer
                </DialogClose>
                <Link className={cn(buttonVariants(), "rounded-2xl")} to="/">
                  Retour accueil
                </Link>
              </div>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </>
  );
}
