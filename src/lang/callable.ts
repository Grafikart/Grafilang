import { StdOut, Value } from "./type.ts";

export class Callable {
  constructor(
    public arity: number,
    public call: (stdOut: StdOut, ...args: unknown[]) => Value | void,
  ) {}
}
