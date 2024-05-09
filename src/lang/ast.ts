import { UnexpectedTokenError } from "./errors.ts";
import {
  BlockStatement,
  DeclarationStatement,
  Expression,
  ExpressionType,
  ForStatement,
  FunctionStatement,
  IfStatement,
  PrintStatement,
  Program,
  ReturnStatement,
  Statement,
  StatementType,
  Token,
  TokenIdentifier,
  TokenType,
  WhileStatement,
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
  if (eat(TokenType.FUNCTION)) {
    return funcDeclarationStatement();
  }
  if (eat(TokenType.RETURN)) {
    return returnStatement();
  }
  if (eat(TokenType.VAR)) {
    return declarationStatement();
  }
  if (eat(TokenType.IF)) {
    return ifStatement();
  }
  if (eat(TokenType.WHILE)) {
    return whileStatement();
  }
  if (eat(TokenType.FOR)) {
    return forStatement();
  }
  if (eat(TokenType.PRINT)) {
    return printStatement();
  }
  if (eat(TokenType.LEFT_BRACE)) {
    return blockStatement(
      [TokenType.RIGHT_BRACE],
      `'}' attendu à la fin d'un block`,
    );
  }
  const expr = expression();
  return {
    type: StatementType.Expression,
    expression: expr,
    position: expr.position,
  };
}

function printStatement(): PrintStatement {
  const start = previous();
  const expr = expression();
  return {
    type: StatementType.Print,
    expression: expr,
    position: [start.position[0], expr.position[1], start.position[2]],
  };
}

function returnStatement(): ReturnStatement {
  const start = previous();
  const expr = expression();
  return {
    type: StatementType.Return,
    expression: expr,
    position: [start.position[0], expr.position[1], start.position[2]],
  };
}

function funcDeclarationStatement(): FunctionStatement {
  const start = previous();
  const name = eatOrFail([TokenType.IDENTIFIER], "Nom de la fonction attendu");
  eatOrFail(
    [TokenType.LEFT_PAREN],
    "'(' attendu pour définir les paramètre de la fonction",
  );
  const params: TokenIdentifier[] = [];
  while (!checkType(TokenType.RIGHT_PAREN)) {
    params.push(eatOrFail([TokenType.IDENTIFIER], "Nom de paramètre attendu"));
    eat(TokenType.COMMA);
  }
  eatOrFail(
    [TokenType.RIGHT_PAREN],
    "')' attendu à la fin de la liste des paramètres",
  );
  const block = blockStatement(
    [TokenType.END],
    "'FIN' attendu à la fin de la fonction",
  );
  return {
    type: StatementType.Function,
    body: block.body,
    name: name,
    parameters: params,
    position: [start.position[0], block.position[1], start.position[2]],
  };
}

function ifStatement(): IfStatement {
  const start = previous();
  const condition = expression();
  eatOrFail([TokenType.THEN], "ALORS est attendu à la fin d'une condition");
  const right = blockStatement(
    [TokenType.END, TokenType.ELSE],
    `'FIN' attendu à la fin d'une condition`,
  );
  const wrong =
    previous().type === TokenType.ELSE ? blockStatement([TokenType.END]) : null;
  return {
    type: StatementType.If,
    condition,
    right,
    wrong,
    position: [start.position[0], previous().position[1], start.position[2]],
  };
}

function whileStatement(): WhileStatement {
  const start = previous();
  const condition = expression();
  const end = eatOrFail(
    [TokenType.THEN],
    `'FAIRE' est attendu après la condition pour une boucle`,
  );
  return {
    type: StatementType.While,
    condition: condition,
    body: blockStatement(
      [TokenType.END],
      `'FIN' attendu à la fin d'une boucle`,
    ),
    position: [start.position[0], end.position[1], start.position[2]],
  };
}

function forStatement(): ForStatement {
  const forToken = previous();
  const identifier = eatOrFail(
    [TokenType.IDENTIFIER],
    "Nom de variable attendu",
  );
  eatOrFail([TokenType.FROM], `'Entre' attendu ici`);
  const start = termExpression();
  eatOrFail([TokenType.AND], `Mot clef 'et' attendu`);
  const end = termExpression();
  const block = blockStatement(
    [TokenType.END],
    `'FIN' attendu à la fin d'une boucle`,
  );
  return {
    type: StatementType.For,
    start: start,
    end: end,
    variable: identifier,
    body: block.body,
    position: [forToken.position[0], block.position[1], forToken.position[2]],
  };
}

function declarationStatement(): DeclarationStatement {
  const name = eatOrFail(
    [TokenType.IDENTIFIER],
    `Un nom de variable est attendu à gauche d'un '='`,
  );
  eatOrFail([TokenType.EQUAL], `'=' attendu pour déclarer une variable`);
  const expr = expression();
  return {
    type: StatementType.Declaration,
    name: name,
    expression: expr,
    position: [name.position[0], expr.position[1], name.position[2]],
  };
}

function blockStatement(
  delimiter = [TokenType.RIGHT_BRACE] as TokenType[],
  errorMessage = `'}' attendu pour fermer le block précédent`,
): BlockStatement {
  const token = peek();
  const statements: Statement[] = [];
  while (!checkType(...delimiter) && !isEnd()) {
    statements.push(statement());
  }
  eatOrFail(delimiter, errorMessage);
  return {
    type: StatementType.Block,
    body: statements,
    position: [token.position[0], previous().position[1], token.position[2]],
  };
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
  return callExpression();
}

function callExpression(): Expression {
  let expr = arrayAccessExpression();
  while (eat(TokenType.LEFT_PAREN)) {
    // On a une parenthèse (donc c'est un appel à une fonction)
    const open = previous();
    const callee = expr;
    // On construit  la liste des paramètres
    const args: Expression[] = [];
    if (!checkType(TokenType.RIGHT_PAREN)) {
      while (true) {
        args.push(expression());
        if (!eat(TokenType.COMMA)) {
          break;
        }
      }
    }
    // On a cloture l'appel
    const close = eatOrFail(
      [TokenType.RIGHT_PAREN],
      "')' attendu à la fin de la liste de paramètre",
    );
    expr = {
      type: ExpressionType.Call,
      callee: callee,
      args: args,
      position: callee.position,
      argsPosition: [open.position[0], close.position[1], callee.position[2]],
    };
  }
  return expr;
}

function arrayAccessExpression(): Expression {
  let expr = arrayExpression();
  while (eat(TokenType.LEFT_BRACKET)) {
    const index = expression();
    eatOrFail(
      [TokenType.RIGHT_BRACKET],
      `"]" attendu après l'index d'un tableau`,
    );
    const closeBracket = previous();
    expr = {
      type: ExpressionType.ArrayAccess,
      source: expr,
      index: index,
      position: [expr.position[0], closeBracket.position[1], expr.position[2]],
    };
  }
  return expr;
}

function arrayExpression(): Expression {
  if (eat(TokenType.LEFT_BRACKET)) {
    const openBracket = previous();
    const elements: Expression[] = [];
    while (!eat(TokenType.RIGHT_BRACKET)) {
      elements.push(expression());
      if (eat(TokenType.RIGHT_BRACKET)) {
        break;
      }
      eatOrFail(
        [TokenType.COMMA],
        '"," attendu entre les éléments d\'un tableau',
      );
    }
    const closeBracket = previous();
    return {
      type: ExpressionType.Array,
      elements: elements,
      position: [
        openBracket.position[0],
        closeBracket.position[1],
        openBracket.position[2],
      ],
    };
  } else {
    return primaryExpression();
  }
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
  if (eat(TokenType.LEFT_BRACKET)) {
  }
  if (eat(TokenType.LEFT_PAREN)) {
    const expr = expression();
    const closeToken = eatOrFail(
      [TokenType.RIGHT_PAREN],
      `')' attendu pour fermer la parenthèse ouvrante`,
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

function eatOrFail<T extends TokenType>(types: T[], message: string) {
  if (checkType(...types)) {
    return advance() as Token & { type: T };
  }
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

function checkType(...types: TokenType[]): boolean {
  return types.includes(peek().type);
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
