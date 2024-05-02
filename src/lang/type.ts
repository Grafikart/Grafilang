export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN = "(",
  RIGHT_PAREN = ")",
  LEFT_BRACE = "{",
  RIGHT_BRACE = "}",
  LEFT_BRACKET = "[",
  RIGHT_BRACKET = "]",
  COMMA = ",",
  DOT = ".",
  MINUS = "-",
  PLUS = "+",
  SEMICOLON = ";",
  SLASH = "/",
  STAR = "*",

  // One or two character tokens.
  BANG = "!",
  BANG_EQUAL = "!=",
  EQUAL = "=",
  EQUAL_EQUAL = "==",
  GREATER = ">",
  GREATER_EQUAL = ">=",
  LESS = "<",
  LESS_EQUAL = "<=",

  // Literals.
  IDENTIFIER = "Identifiant",
  STRING = "Chaine",
  NUMBER = "Nombre",

  // Keywords.
  IF = "Condition",
  AND = "Et",
  OR = "Ou",
  CLASS = "Classe",
  ELSE = "Sinon",
  FALSE = "Faux",
  TRUE = "Vrai",
  PRINT = "Afficher",
  THEN = "Alors",
  VAR = "Var",
  END = "Fin",
  WHILE = "TantQue",

  EOF = "EOF",
}

export type Position = [start: number, end: number, line: number];

export type Token =
  | {
      type: Exclude<TokenType, TokenType.NUMBER>;
      value: string;
      position: Position;
    }
  | {
      type: TokenType.NUMBER;
      value: number;
      position: Position;
    };

/**
 * Expression types
 */

export enum ExpressionType {
  Literal = "Literal",
  Binary = "Binary",
  Logical = "Logical",
  Unary = "Unary",
  Variable = "Variable",
  Assignment = "Assignment",
}

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
export type LogicalExpression = {
  type: ExpressionType.Logical;
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
  value: Expression;
  position: Position;
};
export type Expression =
  | BinaryExpression
  | UnaryExpression
  | LogicalExpression
  | LiteralExpression
  | AssignmentExpression
  | VariableExpression;

/**
 * Statement types
 */

export enum StatementType {
  Program = "Program",
  Expression = "Expression",
  Print = "Print",
  Declaration = "Declaration",
  Block = "Block",
  If = "If",
  While = "While",
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

export type IfStatement = {
  type: StatementType.If;
  condition: Expression;
  right: BlockStatement;
  wrong: BlockStatement | null;
  position: Position;
};

export type WhileStatement = {
  type: StatementType.While;
  condition: Expression;
  body: BlockStatement;
  position: Position;
};

export type Statement =
  | ExpressionStatement
  | PrintStatement
  | BlockStatement
  | IfStatement
  | WhileStatement
  | DeclarationStatement;
