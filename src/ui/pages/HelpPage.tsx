import { BookOpenText } from "lucide-react";

import { helpRoute } from "../routes.tsx";
import { Markdown } from "../components/Markdown.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function HelpPage() {
  const { content, title } = helpRoute.useLoaderData();

  return (
    <main className="flex h-screen flex-1 p-4">
      <ScrollArea className="h-full w-full overflow-auto">
        <Card className="mx-auto w-full max-w-4xl border-border/70 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>
              Référence rapide du langage et de sa syntaxe actuelle.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 pt-5">
            <Markdown>{content}</Markdown>
          </CardContent>
        </Card>
      </ScrollArea>
    </main>
  );
}
