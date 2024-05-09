import type { PropsWithChildren, ReactNode, Ref } from "react";
import clsx from "clsx";

type Props = PropsWithChildren<{
  padded?: boolean;
  className?: string;
  divRef?: Ref<HTMLDivElement>;
  title?: ReactNode;
}>;

export function Card({ children, padded, className, divRef, title }: Props) {
  return (
    <section
      className={clsx("card", padded && "card--padded", className)}
      ref={divRef}
    >
      {title && (
        <header>
          <h2 className="card__title">{title}</h2>
        </header>
      )}
      {children}
    </section>
  );
}
