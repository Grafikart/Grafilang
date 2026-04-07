import { Link } from "@tanstack/react-router";
import { CompassIcon, TriangleAlertIcon } from "lucide-react";

import { getFirstChallenge } from "../challanges.ts";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  const firstChallenge = getFirstChallenge();

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border/70 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="size-5 text-primary" />
            Page introuvable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            La page demandée n&apos;existe pas ou son contenu n&apos;est pas
            encore disponible.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link className={cn(buttonVariants(), "rounded-2xl")} to="/">
              Retour accueil
            </Link>
            {firstChallenge ? (
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-2xl",
                )}
                params={{ slug: firstChallenge.slug }}
                to="/challenges/$slug"
              >
                <CompassIcon className="size-4" />
                Ouvrir un exercice
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
