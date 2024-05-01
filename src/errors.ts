import { Expression } from "./ast.ts";
import { Token } from "./lexer.ts";

export class ParseError extends Error {
  constructor(
    public message: string,
    public line: number,
    public start: number,
    public end?: number,
  ) {
    let columnInfo = `colonne ${start}`;
    if (end && end !== start) {
      columnInfo = `colonne ${start} à ${end}`;
    }
    super(`Erreur de syntaxe : ${message} (ligne ${line}, ${columnInfo})`);
  }
}

export class UnexpectedTokenError extends Error {
  constructor(
    public got: Token,
    public message: string,
  ) {
    super(message);
  }
}

export class RuntimeError extends Error {
  constructor(
    public message: string,
    public expression: Expression | Token,
  ) {
    super(`Erreur à l'exécution`);
  }
}
