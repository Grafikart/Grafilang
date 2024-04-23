import {
  BinaryExpression,
  Expression,
  LiteralExpression,
  Program,
  Statement,
  UnaryExpression,
} from "./ast.ts";
import { TokenType } from "./lexer.ts";
import { RuntimeError } from "./errors.ts";

type Value = LiteralExpression["value"];

export function interpret(ast: Program): Value {
  return ast.body.map(evalStatement).join("\n");
}

function evalStatement(statement: Statement): unknown {
  switch (statement.type) {
    case "Print":
      return evalExpression(statement.expression);
    case "Expression":
      return "";
  }
}

function evalExpression(expr: Expression): Value {
  switch (expr.type) {
    case "Binary":
      return evalBinary(expr);
    case "Unary":
      return evalUnary(expr);
    case "Literal":
      return evalLiteral(expr);
  }
  return null;
}

function evalLiteral(expr: LiteralExpression): Value {
  return expr.value;
}

function evalUnary(expr: UnaryExpression): Value {
  const right = evalExpression(expr.right);
  switch (expr.operator.type) {
    case TokenType.MINUS:
      if (typeof right !== "number") {
        throw new RuntimeError(
          `Impossible d'utiliser l'opérateur "-" sur une valeur qui n'est pas un nombre`,
          expr,
        );
      }
      return right * -1;
    case TokenType.BANG:
      if (typeof right !== "boolean") {
        throw new RuntimeError(
          `Impossible d'utiliser l'opérateur "!" sur une valeur qui n'est pas un booléen (vrai / faux)`,
          expr,
        );
      }
      return !right;
  }

  return null;
}

function evalBinary(expr: BinaryExpression): Value {
  const sides = [evalExpression(expr.left), evalExpression(expr.right)];
  switch (expr.operator.type) {
    case TokenType.MINUS:
      ensureNumbers(sides, `Seul des nombres peuvent être soustraits`, expr);
      return sides[0] - sides[1];
    case TokenType.SLASH:
      ensureNumbers(sides, `Seul des nombres peuvent être divisés`, expr);
      return sides[0] / sides[1];
    case TokenType.STAR:
      ensureNumbers(sides, `Seul des nombres peuvent être multipliés`, expr);
      return sides[0] * sides[1];
    case TokenType.GREATER:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] > sides[1];
    case TokenType.GREATER_EQUAL:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] > sides[1];
    case TokenType.LESS_EQUAL:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] > sides[1];
    case TokenType.LESS:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] > sides[1];
    case TokenType.PLUS:
      if (typeof sides[0] === "number") {
        ensureNumbers(
          sides,
          `Un nombre doit être ajouté à un autre nombre`,
          expr,
        );
        return sides[0] + sides[1];
      } else if (typeof sides[0] === "string") {
        ensureStrings(
          sides,
          `Une chaîne de caractère doit être ajouté avec une autre chaîne`,
          expr,
        );
        return sides[0] + sides[1];
      }
      throw new RuntimeError(
        `Impossible d'additionner ces types ensembles`,
        expr,
      );
    case TokenType.EQUAL_EQUAL:
      return sides[0] === sides[1];
    case TokenType.BANG_EQUAL:
      return sides[0] !== sides[1];
  }

  return null;
}

/**
 * Narrow types
 */

function ensureNumbers(
  values: unknown[],
  message: string,
  expression: Expression,
): asserts values is number[] {
  ensureType(values, "number", message, expression);
}

function ensureStrings(
  values: unknown[],
  message: string,
  expression: Expression,
): asserts values is string[] {
  ensureType(values, "string", message, expression);
}

function ensureType(
  values: unknown[],
  type: "number" | "string",
  message: string,
  expression: Expression,
): asserts values is string[] {
  for (const value of values) {
    if (typeof value !== type) {
      throw new RuntimeError(message, expression);
    }
  }
}
