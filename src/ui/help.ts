export type HelpPageItem = {
  title: string;
  slug: string;
  markdownUrl: string;
};

export const helpPages: HelpPageItem[] = [
  {
    title: "Variables",
    slug: "variables",
    markdownUrl: "/help/variables.md",
  },
  {
    title: "Conditions",
    slug: "conditions",
    markdownUrl: "/help/conditions.md",
  },
  {
    title: "Boucles",
    slug: "boucles",
    markdownUrl: "/help/boucles.md",
  },
  {
    title: "Fonctions",
    slug: "fonctions",
    markdownUrl: "/help/fonctions.md",
  },
  {
    title: "Tableaux",
    slug: "tableaux",
    markdownUrl: "/help/tableaux.md",
  },
  {
    title: "Entrées / Sorties",
    slug: "entrees-sorties",
    markdownUrl: "/help/entrees-sorties.md",
  },
];

export function findHelpPageBySlug(slug: string) {
  return helpPages.find((page) => page.slug === slug) ?? null;
}
