import { Position, Token, Value } from "./type.ts";

export class CodeError extends Error {
  constructor(
    public message: string,
    public position: Position,
  ) {
    super(message);
  }

  withSource(source: string): string {
    const column = this.#getColumn(source);
    return `${this.name}: ligne ${this.position[2]}, colonne ${column}
    
${getLine(this.position[0], source)}
${" ".repeat(column)}${"^".repeat(this.position[1] - this.position[0])}
${" ".repeat(column)}${this.message}`;
  }

  getMarker(source: string) {
    const column = this.#getColumn(source);
    return {
      message: this.message,
      startLineNumber: this.position[2],
      startColumn: column + 1,
      endLineNumber: this.position[2],
      endColumn: column + this.position[1] - this.position[0] + 1,
    };
  }

  #getColumn(source: string): number {
    return Math.max(
      this.position[0] -
        Math.max(source.lastIndexOf("\n", this.position[0]) + 1, 0),
      0,
    );
  }
}

export class ParseError extends CodeError {
  constructor(
    public message: string,
    public position: Position,
  ) {
    super(message, position);
    this.name = "Erreur de syntaxe";
  }
}

export class UnexpectedTokenError extends CodeError {
  constructor(got: Token, message: string) {
    super(`${got.value} inattendu, ${message}`, got.position);
    this.name = "Erreur de syntaxe";
  }
}

export class RuntimeError extends CodeError {
  constructor(
    public message: string,
    public position: Position,
  ) {
    super(message, position);
    this.name = `Erreur à l'exécution`;
  }
}

function getLine(index: number, source: string): string {
  const lineIndex = source.lastIndexOf("\n", index);
  const endLineIndex = source.indexOf("\n", index);
  return source.substring(
    lineIndex === -1 ? 0 : lineIndex,
    endLineIndex === -1 ? undefined : endLineIndex,
  );
}

export class ReturnValue {
  constructor(public value: Value) {}
}
