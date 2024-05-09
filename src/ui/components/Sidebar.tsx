import { Link } from "@tanstack/react-router";
import { BookIcon, ChallengeIcon } from "./Icons.tsx";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link
        to="/challenges/$slug"
        params={{ slug: "boucle-1" }}
        title="Exercices"
      >
        <ChallengeIcon />
      </Link>
      <Link to="/" title="Exercices">
        <BookIcon />
      </Link>
    </aside>
  );
}
