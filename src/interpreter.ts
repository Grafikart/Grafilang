import {
    AssignmentExpression,
    BinaryExpression,
    Expression,
    ExpressionType,
    LiteralExpression,
    Program,
    Statement,
    StatementType,
    UnaryExpression,
    VariableExpression,
} from "./ast.ts";
import {TokenType} from "./lexer.ts";
import {RuntimeError} from "./errors.ts";
import {Memory} from "./memory.ts";

type Value = LiteralExpression["value"];
const globalMemory = new Memory()
let blockMemory = globalMemory;

export function interpret(ast: Program): Value {
    blockMemory = globalMemory
    blockMemory.clear();
    return evalStatements(ast.body) ?? '';
}

function evalStatements(statements: Statement[]): Value | undefined {
    const results = statements.map(evalStatement).filter(v => v !== undefined)
    if (results.length > 0) {
        return results.join("\n")
    }
    return
}

function evalStatement(statement: Statement): unknown {
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
            const previousMemory = blockMemory
            blockMemory = new Memory(blockMemory)
            const results = evalStatements(statement.body)
            blockMemory = previousMemory
            return results;
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
            return evalVariable(expr)
        case ExpressionType.Assignment:
            return evalAssignment(expr)
    }
    return null;
}

function evalVariable(expr: VariableExpression): Value {
    return blockMemory.getValue(expr.name);
}

function evalAssignment(expr: AssignmentExpression): Value {
    return blockMemory.assign(
        expr.variable.name,
        evalExpression(expr.value)
    )
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
