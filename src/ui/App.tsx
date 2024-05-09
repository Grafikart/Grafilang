import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes.tsx";

export function App() {
  return <RouterProvider router={router} />;
}
