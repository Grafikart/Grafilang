import { RuntimeError } from "./errors.ts";
import { LiteralExpression, Token } from "./type.ts";

type Value = LiteralExpression["value"];

/**
 * Gère les variables stockées en mémoire pendant l'exécution du programme
 */
export class Memory {
  #values: Map<string, Value>;
  #parent: Memory | null;

  constructor(parent: Memory | null = null) {
    this.#parent = parent;
    this.#values = new Map();
  }

  getValue(name: Token): Value {
    const variableName = name.value.toString();
    if (this.#values.has(variableName)) {
      return this.#values.get(variableName)!;
    }

    if (this.#parent !== null) {
      return this.#parent.getValue(name);
    }

    throw new RuntimeError(
      `Impossible de redéclarer la variable ${variableName}`,
      name,
    );
  }

  assign(name: Token, v: Value): Value {
    const variableName = name.value.toString();

    if (this.#values.has(variableName)) {
      this.#values.set(variableName, v);
      return v;
    }

    if (this.#parent !== null) {
      return this.#parent.assign(name, v);
    }

    throw new RuntimeError(`La variable ${variableName} n'existe pas`, name);
  }

  define(name: Token, v: Value): Value {
    const variableName = name.value.toString();
    if (this.#values.has(variableName)) {
      throw new RuntimeError(
        `Impossible de redéclarer la variable ${variableName}`,
        name,
      );
    }
    this.#values.set(variableName, v);
    return v;
  }

  clear() {
    this.#values.clear();
  }
}
