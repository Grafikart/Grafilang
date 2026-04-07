import { Badge } from "@/components/ui/badge.tsx";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, CompassIcon, SparklesIcon } from "lucide-react";

export function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <section className="rounded-xl border border-border/70 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 md:max-w-3xl">
          <Badge variant="secondary" className="w-fit">
            Parcours interactif
          </Badge>
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Apprendre l&apos;algorithmique comme dans un atelier de code.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Chaque exercice combine consigne, éditeur, sortie et cas de test
              visibles pour aider l&apos;élève à raisonner, itérer et corriger.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className={cn(buttonVariants({ size: "lg" }), "rounded-2xl")}
              params={{ slug: "boucle-1" }}
              to="/challenges/$slug"
            >
              Ouvrir l&apos;exercice
              <ArrowRightIcon className="size-4" />
            </Link>
            <Button className="rounded-2xl" size="lg" variant="outline">
              <SparklesIcon className="size-4" />
              Prototype pédagogique
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CompassIcon className="size-4 text-primary" />
              Consignes claires
            </CardTitle>
            <CardDescription>
              Le markdown d&apos;exercice devient un vrai panneau de briefing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Titres, listes, objectifs et exemples sont rendus proprement pour
            favoriser la lecture avant le passage au code.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Éditeur au centre</CardTitle>
            <CardDescription>
              L&apos;éditeur Monaco reste le point focal de l&apos;interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Les actions d&apos;exécution sont regroupées au plus près du code,
            ce qui rapproche l&apos;expérience d&apos;un IDE pédagogique.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Feedback immédiat</CardTitle>
            <CardDescription>
              Sortie et cas de test occupent leur propre colonne.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            L&apos;élève voit les résultats de son programme et les attentes
            fonctionnelles sans quitter l&apos;écran.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
