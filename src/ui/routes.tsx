import {
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  Outlet,
} from "@tanstack/react-router";

import { ChallengePage } from "./pages/ChallengePage.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { ChallengeDefinition } from "../type.challenge.ts";
import { findChallengeBySlug } from "./challenges.ts";
import { findHelpPageBySlug } from "./help.ts";
import { HelpPage } from "./pages/HelpPage.tsx";
import { Home } from "./pages/Home.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";

const rootRoute = createRootRoute({
  notFoundComponent: NotFoundPage,
  component: () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,177,62,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(41,121,255,0.12),_transparent_22%),linear-gradient(180deg,_rgba(11,15,26,0.98),_rgba(11,15,26,1))]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <Sidebar />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

export const challengeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/$slug",
  loader: async ({ params }) => {
    const challenge = findChallengeBySlug(params.slug);
    if (!challenge) {
      throw notFound();
    }

    const response = await fetch(challenge.jsonUrl);
    if (!response.ok) {
      throw notFound();
    }

    return (await response.json()) as ChallengeDefinition;
  },
  component: ChallengePage,
});

export const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/aide/$slug",
  loader: async ({ params }) => {
    const page = findHelpPageBySlug(params.slug);
    if (!page) {
      throw notFound();
    }

    const response = await fetch(page.markdownUrl);
    if (!response.ok) {
      throw notFound();
    }

    return {
      title: page.title,
      content: await response.text(),
    };
  },
  component: HelpPage,
});

const routeTree = rootRoute.addChildren([indexRoute, helpRoute, challengeRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
