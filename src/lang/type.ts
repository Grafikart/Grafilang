import type { Callable } from "./callable.ts";

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
  THEN = "Alors",
  VAR = "Var",
  END = "Fin",
  WHILE = "TantQue",
  FOR = "POUR",
  FROM = "DE",
  FUNCTION = "FONCTION",
  RETURN = "RETURN",
  PRINT = "AFFICHER",

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

export type TokenIdentifier = Token & { type: TokenType.IDENTIFIER };

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
  Call = "Call",
  Array = "Array",
  ArrayAccess = "ArrayAccess",
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
  name: TokenIdentifier;
  position: Position;
};
export type AssignmentExpression = {
  type: ExpressionType.Assignment;
  variable: VariableExpression;
  value: Expression;
  position: Position;
};

export type CallExpression = {
  type: ExpressionType.Call;
  callee: Expression;
  args: Expression[];
  position: Position;
  argsPosition: Position;
};

export type ArrayExpression = {
  type: ExpressionType.Array;
  elements: Expression[];
  position: Position;
};

export type ArrayAccessExpression = {
  type: ExpressionType.ArrayAccess;
  source: Expression;
  index: Expression;
  position: Position;
};

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | LogicalExpression
  | LiteralExpression
  | AssignmentExpression
  | CallExpression
  | ArrayExpression
  | ArrayAccessExpression
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
  For = "For",
  Function = "Function",
  Return = "Return",
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

export type FunctionStatement = {
  type: StatementType.Function;
  name: TokenIdentifier;
  parameters: TokenIdentifier[];
  body: Statement[];
  position: Position;
};

export type DeclarationStatement = {
  type: StatementType.Declaration;
  expression: Expression;
  name: TokenIdentifier;
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

export type ForStatement = {
  type: StatementType.For;
  variable: TokenIdentifier;
  start: Expression;
  end: Expression;
  body: Statement[];
  position: Position;
};

export type ReturnStatement = {
  type: StatementType.Return;
  expression: Expression;
  position: Position;
};

export type Statement =
  | ExpressionStatement
  | PrintStatement
  | BlockStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionStatement
  | ReturnStatement
  | DeclarationStatement;

export type StdOut = {
  push: (s: string) => void;
  clear: () => void;
};
export type Value = LiteralExpression["value"] | Callable | Value[] | void;
