import { Memory } from "./memory.ts";
import { Callable } from "./callable.ts";

/**
 * Définit les fonctions standards disponibles dans le langage
 */
export const globals = new Memory();

globals.define(
  "arrondir",
  new Callable(1, (value) => {
    if (typeof value !== "number") {
      throw new Error(
        "Impossible d'arrondir une valeur qui n'est pas un nombre",
      );
    }
    return Math.round(value);
  }),
);

globals.define(
  "taille",
  new Callable(1, (value) => {
    if (!Array.isArray(value)) {
      throw new Error("Tableau attendu en paramètre");
    }
    return value.length;
  }),
);
