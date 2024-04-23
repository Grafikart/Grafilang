import { Position, type Token, TokenType } from "./lexer.ts";
import { UnexpectedTokenError } from "./errors.ts";

export type Program = {
  type: "Program";
  body: Statement[];
};

export type PrintStatement = {
  type: "Print";
  expression: Expression;
  position: Position;
};

export type ExpressionStatement = {
  type: "Expression";
  expression: Expression;
  position: Position;
};

export type LiteralExpression = {
  type: "Literal";
  value: string | number | boolean | null;
  position: Position;
};

export type BinaryExpression = {
  type: "Binary";
  operator: Token;
  left: Expression;
  right: Expression;
  position: Position;
};

export type UnaryExpression = {
  type: "Unary";
  operator: Token;
  right: Expression;
  position: Position;
};

export type Statement = ExpressionStatement | PrintStatement;
export type Expression = BinaryExpression | UnaryExpression | LiteralExpression;

let tokens: Token[] = [];
let cursor = 0;

export function buildASTTree(t: Token[]): Program {
  tokens = t;
  const statements: Statement[] = [];
  while (!isEnd()) {
    statements.push(statement());
  }
  return {
    type: "Program",
    body: statements,
  };
}

/**
 * Statements
 */

function statement(): Statement {
  if (match(TokenType.PRINT)) {
    const expr = expression();
    return {
      type: "Print",
      expression: expr,
      position: expr.position,
    };
  }
  const expr = expression();
  return {
    type: "Expression",
    expression: expr,
    position: expr.position,
  };
}

/**
 * Expression
 */

function expression(): Expression {
  return equality();
}

function equality(): Expression {
  let expr = comparison();
  while (match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
    const operator = previous();
    const right = comparison();
    expr = {
      type: "Binary",
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
    match(
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS_EQUAL,
      TokenType.LESS,
    )
  ) {
    const operator = previous();
    const right = term();
    expr = {
      type: "Binary",
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
  while (match(TokenType.MINUS, TokenType.PLUS)) {
    const operator = previous();
    const right = factor();
    expr = {
      type: "Binary",
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
  while (match(TokenType.SLASH, TokenType.STAR)) {
    const operator = previous();
    const right = unary();
    expr = {
      type: "Binary",
      operator,
      left: expr,
      right: right,
      position: [expr.position[0], right.position[1], expr.position[2]],
    };
  }
  return expr;
}

function unary(): Expression {
  if (match(TokenType.MINUS, TokenType.BANG)) {
    const operator = previous();
    const right = unary();
    return {
      type: "Unary",
      operator: operator,
      right: right,
      position: right.position,
    };
  }
  return primary();
}

function primary(): Expression {
  const token = peek();
  if (match(TokenType.FALSE))
    return {
      type: "Literal",
      value: false,
      position: token.position,
    };
  if (match(TokenType.TRUE))
    return {
      type: "Literal",
      value: true,
      position: token.position,
    };
  if (match(TokenType.NUMBER, TokenType.STRING)) {
    return {
      type: "Literal",
      value: previous().value,
      position: token.position,
    };
  }
  if (match(TokenType.LEFT_PAREN)) {
    const expr = expression();
    const closeToken = consume(TokenType.RIGHT_PAREN);
    return {
      ...expr,
      position: [token.position[0], closeToken.position[1], token.position[2]],
    };
  }
  throw new UnexpectedTokenError(token, "Expression");
}

/**
 * Navigation
 */

function consume(type: TokenType) {
  if (checkType(type)) {
    return advance();
  }
  const token = peek();
  throw new UnexpectedTokenError(token, type);
}

function match(...types: TokenType[]): boolean {
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

function advance(): Token {
  if (!isEnd()) {
    cursor++;
  }
  return previous();
}

function isEnd(): boolean {
  return peek().type === TokenType.EOF;
}

function previous(): Token {
  return tokens[cursor - 1];
}
