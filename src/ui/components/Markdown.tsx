import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className }: Props) {
  return (
    <div
      className={cn(
        "space-y-4 text-sm leading-7 text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ className: headingClassName, ...props }) => (
            <h1
              className={cn(
                "font-heading text-2xl leading-tight font-semibold text-foreground",
                headingClassName,
              )}
              {...props}
            />
          ),
          h2: ({ className: headingClassName, ...props }) => (
            <h2
              className={cn(
                "font-heading text-xl leading-tight font-semibold text-foreground",
                headingClassName,
              )}
              {...props}
            />
          ),
          h3: ({ className: headingClassName, ...props }) => (
            <h3
              className={cn(
                "font-heading text-base leading-tight font-semibold text-foreground",
                headingClassName,
              )}
              {...props}
            />
          ),
          p: ({ className: paragraphClassName, ...props }) => (
            <p
              className={cn("text-sm leading-7", paragraphClassName)}
              {...props}
            />
          ),
          ul: ({ className: listClassName, ...props }) => (
            <ul
              className={cn("ml-5 list-disc space-y-2", listClassName)}
              {...props}
            />
          ),
          ol: ({ className: listClassName, ...props }) => (
            <ol
              className={cn("ml-5 list-decimal space-y-2", listClassName)}
              {...props}
            />
          ),
          li: ({ className: itemClassName, ...props }) => (
            <li className={cn("pl-1", itemClassName)} {...props} />
          ),
          code: ({ className: codeClassName, ...props }) => (
            <code
              className={cn(
                "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8rem] text-foreground",
                codeClassName,
              )}
              {...props}
            />
          ),
          pre: ({ className: preClassName, ...props }) => (
            <pre
              className={cn(
                "overflow-x-auto rounded-xl border bg-background/80 p-4 text-xs text-foreground",
                preClassName,
              )}
              {...props}
            />
          ),
          strong: ({ className: strongClassName, ...props }) => (
            <strong
              className={cn("font-semibold text-foreground", strongClassName)}
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
