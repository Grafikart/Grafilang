import { Memory } from "./memory.ts";
import { Callable } from "./callable.ts";

/**
 * Définit les fonctions standards disponibles dans le langage
 */
export const globals = new Memory();

globals.define(
  "afficher",
  new Callable(1, (out, value) => {
    out.push(`${value}`);
  }),
);
