import {Position, type Token, TokenType} from "./lexer.ts";
import {UnexpectedTokenError} from "./errors.ts";

export enum ExpressionType {
    Literal = "Literal",
    Binary = "Binary",
    Unary = "Unary",
    Variable = "Variable",
    Assignment = "Assignment"
}

export enum StatementType {
    Program = "Program",
    Expression = "Expression",
    Print = "Print",
    Declaration = "Declaration",
    Block = "Block",
}

export type Program = {
    type: StatementType.Program;
    body: Statement[];
};

export type PrintStatement = {
    type: StatementType.Print;
    expression: Expression;
    position: Position;
};

export type ExpressionStatement = {
    type: StatementType.Expression;
    expression: Expression;
    position: Position;
};

export type DeclarationStatement = {
    type: StatementType.Declaration;
    expression: Expression;
    name: Token & { type: TokenType.IDENTIFIER };
    position: Position;
};

export type BlockStatement = {
    type: StatementType.Block;
    body: Statement[];
    position: Position;
};

export type LiteralExpression = {
    type: ExpressionType.Literal;
    value: string | number | boolean | null;
    position: Position;
};

export type BinaryExpression = {
    type: ExpressionType.Binary;
    operator: Token;
    left: Expression;
    right: Expression;
    position: Position;
};

export type UnaryExpression = {
    type: ExpressionType.Unary;
    operator: Token;
    right: Expression;
    position: Position;
};

export type VariableExpression = {
    type: ExpressionType.Variable;
    name: Token & { type: TokenType.IDENTIFIER };
    position: Position;
};

export type AssignmentExpression = {
    type: ExpressionType.Assignment;
    variable: VariableExpression;
    value: Expression,
    position: Position;
};

export type Statement =
    | ExpressionStatement
    | PrintStatement
    | BlockStatement
    | DeclarationStatement;
export type Expression =
    | BinaryExpression
    | UnaryExpression
    | LiteralExpression
    | AssignmentExpression
    | VariableExpression;

let tokens: Token[] = [];
let cursor = 0;

export function buildASTTree(t: Token[]): Program {
    cursor = 0
    tokens = []
    tokens = t;
    const statements: Statement[] = [];
    while (!isEnd()) {
        statements.push(statement());
    }
    return {
        type: StatementType.Program,
        body: statements,
    };
}

/**
 * Statements
 */

function statement(): Statement {
    if (eat(TokenType.VAR)) {
        const name = eatOrFail(TokenType.IDENTIFIER, `Un nom de variable est attendu à gauche d'un "="`);
        eatOrFail(TokenType.EQUAL, `"=" attendu pour déclarer une variable`)
        const expr = expression();
        return {
            type: StatementType.Declaration,
            name: name,
            expression: expr,
            position: [name.position[0], expr.position[1], name.position[2]],
        };
    }
    if (eat(TokenType.PRINT)) {
        const expr = expression();
        return {
            type: StatementType.Print,
            expression: expr,
            position: expr.position,
        };
    }
    if (eat(TokenType.LEFT_BRACE)) {
        const token = peek()
        return {
            type: StatementType.Block,
            body: blockStatements(),
            position: [token.position[0], previous().position[1], token.position[2]]
        };
    }
    const expr = expression();
    return {
        type: StatementType.Expression,
        expression: expr,
        position: expr.position,
    };
}

function blockStatements(): Statement[] {
    const statements: Statement[] = []
    while (!checkType(TokenType.RIGHT_BRACE) && !isEnd()) {
        statements.push(statement())
    }
    eatOrFail(TokenType.RIGHT_BRACE, `"}" attendu pour fermer le block précédent`)
    return statements
}

/**
 * Expression
 */

function expression(): Expression {
    return assignment();
}

function assignment(): Expression {
    let expr = equality()
    if (eat(TokenType.EQUAL)) {
        const token = previous()
        const right = assignment()
        if (expr.type !== ExpressionType.Variable) {
            throw new UnexpectedTokenError(token, "L'expression à gauche d'un = doit être une variable")
        }
        expr = {
            type: ExpressionType.Assignment,
            variable: expr,
            value: right,
            position: [expr.position[0], right.position[1], expr.position[2]]
        }
    }
    return expr
}

function equality(): Expression {
    let expr = comparison();
    while (eat(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
        const operator = previous();
        const right = comparison();
        expr = {
            type: ExpressionType.Binary,
            operator,
            left: expr,
            right: right,
            position: [expr.position[0], right.position[1], expr.position[2]],
        };
    }
    return expr;
}

function comparison(): Expression {
    let expr = term();
    while (
        eat(
            TokenType.GREATER,
            TokenType.GREATER_EQUAL,
            TokenType.LESS_EQUAL,
            TokenType.LESS,
        )
        ) {
        const operator = previous();
        const right = term();
        expr = {
            type: ExpressionType.Binary,
            operator,
            left: expr,
            right: right,
            position: [expr.position[0], right.position[1], expr.position[2]],
        };
    }
    return expr;
}

function term(): Expression {
    let expr = factor();
    while (eat(TokenType.MINUS, TokenType.PLUS)) {
        const operator = previous();
        const right = factor();
        expr = {
            type: ExpressionType.Binary,
            operator,
            left: expr,
            right: right,
            position: [expr.position[0], right.position[1], expr.position[2]],
        };
    }
    return expr;
}

function factor(): Expression {
    let expr = unary();
    while (eat(TokenType.SLASH, TokenType.STAR)) {
        const operator = previous();
        const right = unary();
        expr = {
            type: ExpressionType.Binary,
            operator,
            left: expr,
            right: right,
            position: [expr.position[0], right.position[1], expr.position[2]],
        };
    }
    return expr;
}

function unary(): Expression {
    if (eat(TokenType.MINUS, TokenType.BANG)) {
        const operator = previous();
        const right = unary();
        return {
            type: ExpressionType.Unary,
            operator: operator,
            right: right,
            position: right.position,
        };
    }
    return primary();
}

function primary(): Expression {
    const token = peek();
    if (eat(TokenType.FALSE))
        return {
            type: ExpressionType.Literal,
            value: false,
            position: token.position,
        };
    if (eat(TokenType.TRUE))
        return {
            type: ExpressionType.Literal,
            value: true,
            position: token.position,
        };
    if (eat(TokenType.NUMBER, TokenType.STRING)) {
        return {
            type: ExpressionType.Literal,
            value: previous().value,
            position: token.position,
        };
    }
    if (eat(TokenType.IDENTIFIER)) {
        return {
            type: ExpressionType.Variable,
            name: previous() as Token & { type: "Identifier" },
            position: token.position,
        };
    }
    if (eat(TokenType.LEFT_PAREN)) {
        const expr = expression();
        const closeToken = eatOrFail(TokenType.RIGHT_PAREN, `")" attendu pour fermer la parenthèse ouvrante`);
        return {
            ...expr,
            position: [token.position[0], closeToken.position[1], token.position[2]],
        };
    }
    throw new UnexpectedTokenError(token, "Expression attendue (nombre, chaîne, variable...)");
}

/**
 * Navigation
 */

function eatOrFail<T extends TokenType>(type: T, message: string) {
    if (checkType(type)) {
        return advance() as Token & { type: T };
    }
    console.log(peek())
    throw new UnexpectedTokenError(peek(), message);
}

function eat(...types: TokenType[]): boolean {
    for (const type of types) {
        if (checkType(type)) {
            advance();
            return true;
        }
    }
    return false;
}

function checkType(type: TokenType): boolean {
    return peek().type === type;
}

function peek(n = 1): Token {
    return tokens[cursor + n - 1];
}

function advance(n = 1): Token {
    if (!isEnd()) {
        cursor++;
    }
    if (n > 1) {
        return advance(n - 1);
    }
    return previous();
}

function isEnd(): boolean {
    return peek().type === TokenType.EOF;
}

function previous(): Token {
    return tokens[cursor - 1];
}
