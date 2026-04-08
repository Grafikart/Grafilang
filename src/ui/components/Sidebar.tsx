import {useEffect, useMemo, useState} from "react";
import {Link, useRouterState} from "@tanstack/react-router";
import {BookOpenText, ChevronRight, Code2, Compass,} from "lucide-react";
import {Collapsible, CollapsiblePanel, CollapsibleTrigger,} from "@/components/ui/collapsible";
import {cn} from "@/lib/utils";
import {challenges} from "../challenges.ts";
import {helpPages} from "../help.ts";

function SidebarTreeLink({
  to,
  params,
  children,
}: {
  to: "/aide/$slug" | "/challenges/$slug";
  params: { slug: string };
  children: string;
}) {
  return (
    <Link
      activeOptions={{ exact: true }}
      activeProps={{
        className:
          "text-primary",
      }}
      className={cn(
        "flex items-center gap-4 relative pl-4 text-muted-foreground",
      )}
      params={params}
      to={to}
    >
      <span className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sidebar-border bg-sidebar -ml-px" />
      <span className="truncate">{children}</span>
    </Link>
  );
}

function SidebarRoot({
  active,
  className,
  icon,
  label,
  open,
  onClick,
}: {
  active: boolean;
  className?: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex items-center justify-start rounded-2xl px-2 py-1.5 text-sidebar-foreground",
        active && "text-sidebar-accent-foreground font-semibold",
        className,
      )}
      onClick={onClick}
    >

        <span
          className={cn(
            "size-8 grid place-items-center rounded-md bg-sidebar-accent/40 text-sidebar-foreground/70 transition-colors",
            active &&
              "bg-sidebar-primary/16 text-primary",
          )}
        >
          {icon}
        </span>
        {label}

      <ChevronRight
        className={cn(
          "size-4 text-sidebar-foreground/45 transition-transform ml-auto",
          open && "rotate-90",
        )}
      />
    </CollapsibleTrigger>
  );
}

export function Sidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const activeExerciseCategory = useMemo(
    () =>
      challenges.find((category) =>
        category.items.some((item) => pathname === `/challenges/${item.slug}`),
      )?.title ?? null,
    [pathname],
  );

  const [helpOpen, setHelpOpen] = useState(pathname.startsWith("/aide/"));
  const [exercisesOpen, setExercisesOpen] = useState(
    pathname.startsWith("/challenges/"),
  );
  const [categoryOpen, setCategoryOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      challenges.map((category) => [
        category.title,
        category.title === activeExerciseCategory,
      ]),
    ),
  );

  useEffect(() => {
    if (pathname.startsWith("/aide/")) {
      setHelpOpen(true);
    }
    if (pathname.startsWith("/challenges/")) {
      setExercisesOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!activeExerciseCategory) {
      return;
    }

    setCategoryOpen((current) => ({
      ...current,
      [activeExerciseCategory]: true,
    }));
  }, [activeExerciseCategory]);

  return (
    <aside className="flex flex-col gap-5 border-b border-sidebar-border/80 bg-[linear-gradient(180deg,rgba(14,18,28,0.98),rgba(11,15,26,0.98))] px-4 py-4 backdrop-blur lg:h-screen lg:border-r lg:border-b-0 lg:px-4 lg:py-5">
      <Link className="flex items-center gap-3" to="/">
        <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/15">
          <Code2 className="size-5" />
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-sidebar-foreground/45">
            Grafilang
          </p>
          <p className="font-heading text-sm font-medium text-sidebar-foreground">
            Atelier algo
          </p>
        </div>
      </Link>

      <div className="px-1">
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-sidebar-foreground/35">
          Navigation
        </p>
      </div>

      <nav className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
        <Collapsible onOpenChange={setHelpOpen} open={helpOpen}>
          <SidebarRoot
            active={pathname.startsWith("/aide/")}
            icon={<BookOpenText className="size-4" />}
            label="Aide"
            open={helpOpen}
          />
          <CollapsiblePanel className="pl-4">
            <div className="relative ml-2 mt-1 space-y-1.5 border-l border-sidebar-border/70">
              {helpPages.map((page) => (
                <SidebarTreeLink
                  key={page.slug}
                  params={{ slug: page.slug }}
                  to="/aide/$slug"
                >
                  {page.title}
                </SidebarTreeLink>
              ))}
            </div>
          </CollapsiblePanel>
        </Collapsible>

        <Collapsible onOpenChange={setExercisesOpen} open={exercisesOpen}>
          <SidebarRoot
            active={pathname.startsWith("/challenges/")}
            icon={<Compass className="size-4" />}
            label="Exercices"
            open={exercisesOpen}
          />
          <CollapsiblePanel className="pl-4">
            <div className="relative ml-2 mt-1 space-y-1.5 border-l border-sidebar-border/70">
            {challenges.map((category) => {
              const isCategoryActive = category.title === activeExerciseCategory;
              const isOpen = categoryOpen[category.title] ?? false;

              return (
                <Collapsible
                  key={category.title}
                  onOpenChange={(open) =>
                    setCategoryOpen((current) => ({
                      ...current,
                      [category.title]: open,
                    }))
                  }
                  open={isOpen}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex items-center text-muted-foreground relative pl-4",
                      isCategoryActive &&
                        "text-foreground",
                    )}
                  >
                      <span className="absolute -ml-px left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sidebar-border bg-sidebar" />
                      <span>{category.title}</span>
                    <ChevronRight
                      className={cn(
                        "size-4 transition-transform",
                        isOpen && "rotate-90",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsiblePanel className="pl-6">
                    <div className="relative ml-2 mt-1 space-y-1.5">
                      {category.items.map((item) => (
                        <SidebarTreeLink
                          key={item.slug}
                          params={{ slug: item.slug }}
                          to="/challenges/$slug"
                        >
                          {item.title}
                        </SidebarTreeLink>
                      ))}
                    </div>
                  </CollapsiblePanel>
                </Collapsible>
              );
            })}
            </div>
          </CollapsiblePanel>
        </Collapsible>
      </nav>
    </aside>
  );
}
