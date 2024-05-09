import { challengeRoute } from "../routes.tsx";
import { Editor } from "../components/Editor.tsx";
import { Output } from "../components/Output.tsx";
import { Card } from "../components/Card.tsx";
import { Actions } from "../components/Actions.tsx";

export function ChallengePage() {
  const { title, description, code } = challengeRoute.useLoaderData();
  return (
    <div>
      <h1 className="challenge-title">{title}</h1>
      <Actions />
      <main className="challenge">
        <div className="challenge__row">
          <Card className="challenge__description formatted">
            <h1>{title}</h1>
            <p>{description}</p>
          </Card>
        </div>
        <div className="challenge__row">
          <Editor defaultValue={code} />
          <Output />
        </div>
      </main>
    </div>
  );
}
