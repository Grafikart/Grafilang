import { RuntimeError } from "./errors.ts";
import { Memory } from "./memory.ts";
import {
  AssignmentExpression,
  BinaryExpression,
  Expression,
  ExpressionType,
  LiteralExpression,
  LogicalExpression,
  Program,
  Statement,
  StatementType,
  TokenType,
  UnaryExpression,
  VariableExpression,
} from "./type.ts";

type Value = LiteralExpression["value"];
const globalMemory = new Memory();
let blockMemory = globalMemory;

export function interpret(ast: Program): Value {
  if (!import.meta.env.TEST) {
    console.log(ast);
  }
  blockMemory = globalMemory;
  blockMemory.clear();
  return evalStatements(ast.body) ?? "";
}

function evalStatements(statements: Statement[]): Value | undefined {
  const results = statements.map(evalStatement).filter((v) => v !== undefined);
  if (results.length > 0) {
    return results.join("\n");
  }
  return;
}

function evalStatement(statement: Statement | null): unknown {
  if (statement === null) {
    return;
  }
  switch (statement.type) {
    case StatementType.Print:
      return evalExpression(statement.expression);
    case StatementType.Expression:
      evalExpression(statement.expression);
      return;
    case StatementType.Declaration:
      blockMemory.define(statement.name, evalExpression(statement.expression));
      return;
    case StatementType.Block:
      const previousMemory = blockMemory;
      blockMemory = new Memory(blockMemory);
      const results = evalStatements(statement.body);
      blockMemory = previousMemory;
      return results;
    case StatementType.If:
      const conditionValue = evalExpression(statement.condition);
      ensureBoolean(
        conditionValue,
        `Un booléen doit être utilisé pour une condition`,
        statement.condition,
      );
      return evalStatement(conditionValue ? statement.right : statement.wrong);
  }
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
