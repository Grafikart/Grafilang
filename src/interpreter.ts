import { RuntimeError } from "./errors.ts";
import { Memory } from "./memory.ts";
import {
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  Expression,
  ExpressionType,
  LiteralExpression,
  LogicalExpression,
  Statement,
  StatementType,
  TokenType,
  UnaryExpression,
  VariableExpression,
  WhileStatement,
} from "./type.ts";
import { buildASTTree } from "./ast.ts";
import { parseTokens } from "./lexer.ts";

type Value = LiteralExpression["value"];
const globalMemory = new Memory();
let blockMemory = globalMemory;
let stdOut = (_: unknown) => {};

export function interpret(source: string): string {
  const ast = buildASTTree(parseTokens(source));
  let out: unknown[] = [];
  stdOut = (v) => out.push(v);
  if (!import.meta.env.TEST) {
    console.log("AST:", ast);
  }
  blockMemory = globalMemory;
  blockMemory.clear();
  ast.body.map(evalStatement);
  return out.join("\n");
}

function evalStatement(statement: Statement | null): void {
  if (statement === null) {
    return;
  }
  switch (statement.type) {
    case StatementType.Print:
      stdOut(evalExpression(statement.expression));
      return;
    case StatementType.Expression:
      evalExpression(statement.expression);
      return;
    case StatementType.Declaration:
      blockMemory.define(statement.name, evalExpression(statement.expression));
      return;
    case StatementType.Block:
      evalBlock(statement);
      return;
    case StatementType.If:
      const conditionValue = evalExpression(statement.condition);
      ensureBoolean(
        conditionValue,
        `Un booléen doit être utilisé pour une condition`,
        statement.condition,
      );
      evalStatement(conditionValue ? statement.right : statement.wrong);
      return;
    case StatementType.While:
      evalWhile(statement);
      return;
  }
}

function evalWhile(statement: WhileStatement): void {
  let limiter = 0; // Pour éviter les boucles infinies, on limite à 10 000 itérations
  while (evalExpression(statement.condition)) {
    limiter++;
    if (limiter > 10_000) {
      throw new RuntimeError(
        "Boucle infinie, la condition de cette boucle ne devient jamais fausse",
        statement.condition,
      );
    }
    evalBlock(statement.body);
  }
}

function evalBlock(statement: BlockStatement): void {
  const previousMemory = blockMemory;
  blockMemory = new Memory(blockMemory);
  statement.body.map(evalStatement);
  blockMemory = previousMemory;
}

function evalExpression(expr: Expression): Value {
  switch (expr.type) {
    case ExpressionType.Binary:
      return evalBinary(expr);
    case ExpressionType.Unary:
      return evalUnary(expr);
    case ExpressionType.Literal:
      return evalLiteral(expr);
    case ExpressionType.Variable:
      return evalVariable(expr);
    case ExpressionType.Assignment:
      return evalAssignment(expr);
    case ExpressionType.Logical:
      return evalLogical(expr);
  }
  return null;
}

function evalVariable(expr: VariableExpression): Value {
  return blockMemory.getValue(expr.name);
}

function evalAssignment(expr: AssignmentExpression): Value {
  return blockMemory.assign(expr.variable.name, evalExpression(expr.value));
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
      return sides[0] >= sides[1];
    case TokenType.LESS_EQUAL:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] <= sides[1];
    case TokenType.LESS:
      ensureNumbers(sides, `Seul des nombres peuvent être comparés`, expr);
      return sides[0] < sides[1];
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

function evalLogical(expr: LogicalExpression): boolean {
  const left = evalExpression(expr.left);
  ensureBoolean(
    left,
    `L'expression à gauche d'un ${expr.operator.value} doit être un booléen`,
    expr.left,
  );
  // Pour les conditions, on peut courtcircuiter si (false et ... / true ou ...)
  if (
    (!left && expr.operator.type === TokenType.AND) ||
    (left && expr.operator.type === TokenType.OR)
  ) {
    return left;
  }
  const right = evalExpression(expr.right);
  ensureBoolean(
    right,
    `L'expression à droite d'un ${expr.operator.value} doit être un booléen`,
    expr.left,
  );
  return right;
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

function ensureBoolean(
  value: unknown,
  message: string,
  expression: Expression,
): asserts value is boolean {
  ensureType(value, "boolean", message, expression);
}

function ensureType(
  value: unknown,
  type: "number" | "string" | "boolean",
  message: string,
  expression: Expression,
) {
  if (Array.isArray(value)) {
    value.forEach((v) => ensureType(v, type, message, expression));
    return;
  }
  if (typeof value !== type) {
    console.log(value);
    throw new RuntimeError(message + ` (${typeof value})`, expression);
  }
}
