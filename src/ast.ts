import { UnexpectedTokenError } from "./errors.ts";
import {
  DeclarationStatement,
  Expression,
  ExpressionType,
  IfStatement,
  Program,
  Statement,
  StatementType,
  Token,
  TokenType,
} from "./type.ts";

let tokens: Token[] = [];
let cursor = 0;

export function buildASTTree(t: Token[]): Program {
  cursor = 0;
  tokens = [];
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
    return declarationStatement();
  }
  if (eat(TokenType.IF)) {
    return ifStatement();
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
    const token = peek();
    return {
      type: StatementType.Block,
      body: blockStatements(),
      position: [token.position[0], previous().position[1], token.position[2]],
    };
  }
  const expr = expression();
  return {
    type: StatementType.Expression,
    expression: expr,
    position: expr.position,
  };
}

function ifStatement(): IfStatement {
  const condition = expression();
  eatOrFail(TokenType.THEN, "ALORS est attendu à la fin d'une condition");
  const right = statement();
  const wrong = eat(TokenType.ELSE) ? statement() : null;
  eatOrFail(TokenType.END, "FIN est attendu pour clôturer une condition");
  return {
    type: StatementType.If,
    condition,
    right,
    wrong,
  };
}

function declarationStatement(): DeclarationStatement {
  const name = eatOrFail(
    TokenType.IDENTIFIER,
    `Un nom de variable est attendu à gauche d'un "="`,
  );
  eatOrFail(TokenType.EQUAL, `"=" attendu pour déclarer une variable`);
  const expr = expression();
  return {
    type: StatementType.Declaration,
    name: name,
    expression: expr,
    position: [name.position[0], expr.position[1], name.position[2]],
  };
}

function blockStatements(): Statement[] {
  const statements: Statement[] = [];
  while (!checkType(TokenType.RIGHT_BRACE) && !isEnd()) {
    statements.push(statement());
  }
  eatOrFail(
    TokenType.RIGHT_BRACE,
    `"}" attendu pour fermer le block précédent`,
  );
  return statements;
}

/**
 * Expression
 */

function expression(): Expression {
  return assignmentExpression();
}

function assignmentExpression(): Expression {
  let expr = orExpression();
  if (eat(TokenType.EQUAL)) {
    const token = previous();
    const right = assignmentExpression();
    if (expr.type !== ExpressionType.Variable) {
      throw new UnexpectedTokenError(
        token,
        "L'expression à gauche d'un = doit être une variable",
      );
    }
    expr = {
      type: ExpressionType.Assignment,
      variable: expr,
      value: right,
      position: [expr.position[0], right.position[1], expr.position[2]],
    };
  }
  return expr;
}

function orExpression(): Expression {
  let expr = andExpression();
  while (eat(TokenType.OR)) {
    const operator = previous();
    const right = andExpression();
    expr = {
      type: ExpressionType.Logical,
      operator,
      left: expr,
      right: right,
      position: [expr.position[0], right.position[1], expr.position[2]],
    };
  }
  return expr;
}

function andExpression(): Expression {
  let expr = equalityExpression();
  while (eat(TokenType.AND)) {
    const operator = previous();
    const right = equalityExpression();
    expr = {
      type: ExpressionType.Logical,
      operator,
      left: expr,
      right: right,
      position: [expr.position[0], right.position[1], expr.position[2]],
    };
  }
  return expr;
}

function equalityExpression(): Expression {
  let expr = comparisonExpression();
  while (eat(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
    const operator = previous();
    const right = comparisonExpression();
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

function comparisonExpression(): Expression {
  let expr = termExpression();
  while (
    eat(
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS_EQUAL,
      TokenType.LESS,
    )
  ) {
    const operator = previous();
    const right = termExpression();
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

function termExpression(): Expression {
  let expr = factorExpression();
  while (eat(TokenType.MINUS, TokenType.PLUS)) {
    const operator = previous();
    const right = factorExpression();
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

function factorExpression(): Expression {
  let expr = unaryExpression();
  while (eat(TokenType.SLASH, TokenType.STAR)) {
    const operator = previous();
    const right = unaryExpression();
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

function unaryExpression(): Expression {
  if (eat(TokenType.MINUS, TokenType.BANG)) {
    const operator = previous();
    const right = unaryExpression();
    return {
      type: ExpressionType.Unary,
      operator: operator,
      right: right,
      position: right.position,
    };
  }
  return primaryExpression();
}

function primaryExpression(): Expression {
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
    const closeToken = eatOrFail(
      TokenType.RIGHT_PAREN,
      `")" attendu pour fermer la parenthèse ouvrante`,
    );
    return {
      ...expr,
      position: [token.position[0], closeToken.position[1], token.position[2]],
    };
  }
  throw new UnexpectedTokenError(
    token,
    "Expression attendue (nombre, chaîne, variable...)",
  );
}

/**
 * Navigation
 */

function eatOrFail<T extends TokenType>(type: T, message: string) {
  if (checkType(type)) {
    return advance() as Token & { type: T };
  }
  console.log(peek());
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
