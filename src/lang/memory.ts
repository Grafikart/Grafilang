import { RuntimeError } from "./errors.ts";
import { Token, Value } from "./type.ts";

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
      `La variable "${variableName}" n'existe pas`,
      name.position,
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

    throw new RuntimeError(
      `La variable "${variableName}" n'existe pas`,
      name.position,
    );
  }

  define(name: Token | string, v: Value): Value {
    if (typeof name == "string") {
      this.#values.set(name, v);
      return v;
    }
    const variableName = name.value.toString();
    if (this.#values.has(variableName)) {
      throw new RuntimeError(
        `Impossible de redéclarer la variable ${variableName}`,
        name.position,
      );
    }
    this.#values.set(variableName, v);
    return v;
  }

  clear() {
    this.#values.clear();
  }
}
