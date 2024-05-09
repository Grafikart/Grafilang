import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { ChallengePage } from "./pages/ChallengePage.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { ChallengeDefinition } from "../type.challenge.ts";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="root">
        <Sidebar />
        <Outlet />
      </div>
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    return (
      <div className="p-2">
        <h3>Welcome Home!</h3>
      </div>
    );
  },
});

export const challengeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/challenges/$slug",
  loader: ({ params }) => {
    return fetch("/challenges/" + params.slug + ".json").then((res) =>
      res.json(),
    ) as Promise<ChallengeDefinition>;
  },
  component: ChallengePage,
});

const routeTree = rootRoute.addChildren([indexRoute, challengeRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
