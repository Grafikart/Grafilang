import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-3 text-left outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger };
