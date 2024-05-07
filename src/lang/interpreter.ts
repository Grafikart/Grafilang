import { ReturnValue, RuntimeError } from "./errors.ts";
import { Memory } from "./memory.ts";
import {
  ArrayAccessExpression,
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  Expression,
  ExpressionType,
  ForStatement,
  FunctionStatement,
  LiteralExpression,
  LogicalExpression,
  ReturnStatement,
  Statement,
  StatementType,
  StdOut,
  TokenType,
  UnaryExpression,
  Value,
  VariableExpression,
  WhileStatement,
} from "./type.ts";
import { buildASTTree } from "./ast.ts";
import { parseTokens } from "./lexer.ts";
import { globals } from "./stdlib.ts";
import { Callable } from "./callable.ts";

let blockMemory = new Memory(globals);
let stdOut: StdOut;

export function interpret(source: string, out: StdOut): void {
  const ast = buildASTTree(parseTokens(source));
  stdOut = out;
  if (!import.meta.env.TEST) {
    console.log("AST:", ast);
  }
  blockMemory.clear();
  ast.body.map(evalStatement);
}

function evalStatement(statement: Statement | null): void {
  if (statement === null) {
    return;
  }
  switch (statement.type) {
    case StatementType.Expression:
      evalExpression(statement.expression);
      return;
    case StatementType.Declaration:
      blockMemory.define(statement.name, evalExpression(statement.expression));
      return;
    case StatementType.Block:
      evalBlock(statement);
      return;
    case StatementType.Print:
      stdOut.push(`${evalExpression(statement.expression)}`);
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
    case StatementType.For:
      evalFor(statement);
      return;
    case StatementType.Function:
      evalFuncDeclar(statement);
      return;
    case StatementType.Return:
      evalReturn(statement);
  }
}

function evalReturn(statement: ReturnStatement): void {
  throw new ReturnValue(evalExpression(statement.expression));
}

function evalFuncDeclar(statement: FunctionStatement): void {
  const name = statement.name.value;
  blockMemory.define(
    name,
    new Callable(statement.parameters.length, (...args) => {
      const previousMemory = blockMemory;
      blockMemory = new Memory(blockMemory);
      statement.parameters.map((param, k) =>
        blockMemory.define(param.value, args[k]),
      );
      try {
        statement.body.map(evalStatement);
      } catch (e) {
        if (e instanceof ReturnValue) {
          blockMemory = previousMemory;
          return e.value;
        }
        throw e;
      }
      blockMemory = previousMemory;
    }),
  );
}

function evalWhile(statement: WhileStatement): void {
  let limiter = 0; // Pour éviter les boucles infinies, on limite à 10 000 itérations
  while (evalExpression(statement.condition)) {
    limiter++;
    if (limiter > 10_000) {
      throw new RuntimeError(
        "Boucle infinie, la condition de cette boucle ne devient jamais fausse",
        statement.condition.position,
      );
    }
    evalBlock(statement.body);
  }
}

function evalFor(statement: ForStatement): void {
  const previousMemory = blockMemory;
  const start = evalExpression(statement.start);
  const end = evalExpression(statement.end);
  ensureNumber(
    start,
    "La valeur de départ de la boucle doit être un nombre",
    statement.start,
  );
  ensureNumber(
    end,
    "La valeur de fin de la boucle doit être un nombre",
    statement.start,
  );
  const increment = start <= end ? 1 : -1;
  for (
    let i = start;
    increment === 1 ? i <= end : i >= end;
    i = i + increment
  ) {
    blockMemory = new Memory(blockMemory);
    blockMemory.define(statement.variable, i);
    statement.body.map(evalStatement);
    blockMemory = previousMemory;
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
    case ExpressionType.Call:
      return evalCall(expr);
    case ExpressionType.Array:
      return evalArray(expr);
    case ExpressionType.ArrayAccess:
      return evalArrayAcccess(expr);
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
          expr.position,
        );
      }
      return right * -1;
    case TokenType.BANG:
      if (typeof right !== "boolean") {
        throw new RuntimeError(
          `Impossible d'utiliser l'opérateur "!" sur une valeur qui n'est pas un booléen (vrai / faux)`,
          expr.position,
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
        expr.position,
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

function evalCall(expr: CallExpression): Value {
  const callee = evalExpression(expr.callee);
  if (!(callee instanceof Callable)) {
    throw new RuntimeError(`La valeur n'est pas une fonction`, expr.position);
  }
  if (callee.arity !== expr.args.length) {
    throw new RuntimeError(
      `La fonction attend ${callee.arity} paramètre (${expr.args.length} obtenus)`,
      expr.argsPosition,
    );
  }
  return callee.call(...expr.args.map(evalExpression));
}

function evalArray(expr: ArrayExpression): Value {
  return expr.elements.map(evalExpression);
}

function evalArrayAcccess(expr: ArrayAccessExpression): Value {
  const source = evalExpression(expr.source);
  if (!Array.isArray(source)) {
    throw new RuntimeError(
      `Impossible d'utiliser cet élément comme un tableau`,
      expr.source.position,
    );
  }
  const index = evalExpression(expr.index);
  if (typeof index !== "number") {
    throw new RuntimeError(
      `L'index d'un tableau doit être un nombre`,
      expr.index.position,
    );
  }
  if (index >= source.length) {
    throw new RuntimeError(
      `L'index est supérieur à la taille du tableau (index: ${index}, taille: ${source.length})`,
      expr.index.position,
    );
  }
  if (index < 0) {
    throw new RuntimeError(
      `L'index d'un tableau ne peut pas être négatif (valeur obtenue: ${index})`,
      expr.index.position,
    );
  }
  return source[index];
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

function ensureNumber(
  values: unknown,
  message: string,
  expression: Expression,
): asserts values is number {
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
    throw new RuntimeError(message + ` (${typeof value})`, expression.position);
  }
}
