import { Value } from "./type.ts";

export class Callable {
  constructor(
    public arity: number,
    public call: (...args: Value[]) => Value | void,
  ) {}
}
