import { Link } from "@tanstack/react-router";
import { BookOpenText, Code2, Compass, Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  return (
    <aside className="flex flex-row items-center justify-between gap-3 border-b border-sidebar-border/80 bg-sidebar/90 px-4 py-3 backdrop-blur lg:flex-col lg:justify-start lg:border-r lg:border-b-0 lg:px-3 lg:py-5">
      <div className="flex items-center gap-3 lg:flex-col">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/15">
          <Code2 className="size-5" />
        </div>
        <div className="lg:text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sidebar-foreground/60">
            Grafilang
          </p>
          <p className="font-heading text-sm font-medium text-sidebar-foreground">
            Atelier algo
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-2 lg:flex-col">
        <Link
          activeProps={{
            className:
              "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
          }}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "size-11 rounded-2xl border border-transparent bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
          title="Accueil"
          to="/"
        >
          <Home className="size-5" />
        </Link>
        <Link
          activeProps={{
            className:
              "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
          }}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "size-11 rounded-2xl border border-transparent bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
          to="/challenges/$slug"
          params={{ slug: "boucle-1" }}
          title="Exercices"
        >
          <Compass className="size-5" />
        </Link>
      </nav>

      <div className="hidden rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/70 lg:block">
        <BookOpenText className="mb-2 size-4 text-primary" />
        Exerce-toi puis soumets quand les cas visibles te semblent solides.
      </div>
    </aside>
  );
}
