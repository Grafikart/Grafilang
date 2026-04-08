export type ChallengeItem = {
  title: string;
  slug: string;
  jsonUrl: string;
};

export type ChallengeCategory = {
  title: string;
  items: ChallengeItem[];
};

export const challenges: ChallengeCategory[] = [
  {
    title: 'Variables',
    items: [
      {
        title: 'TVA',
        slug: 'tva',
        jsonUrl: '/challenges/vars/tva.json'
      }
    ]
  },
  {
    title: "Boucles",
    items: [
      {
        title: "Boucle",
        slug: "boucle-1",
        jsonUrl: "/challenges/boucle-1.json",
      },
    ],
  },
  {
    title: "Tableaux",
    items: [
      {
        title: "Tableau - Somme",
        slug: "tableau-1",
        jsonUrl: "/challenges/tableau-1.json",
      },
    ],
  },
];

export function findChallengeBySlug(slug: string) {
  for (const category of challenges) {
    const challenge = category.items.find((item) => item.slug === slug);
    if (challenge) {
      return challenge;
    }
  }

  return null;
}

export function getFirstChallenge() {
  return challenges[0]?.items[0] ?? null;
}
