import { ParseError } from "./errors.ts";
import { Token, TokenType } from "./type.ts";

export const Keywords = new Map([
  ["and", TokenType.AND],
  ["et", TokenType.AND],
  ["or", TokenType.OR],
  ["ou", TokenType.OR],
  ["class", TokenType.CLASS],
  ["else", TokenType.ELSE],
  ["sinon", TokenType.ELSE],
  ["alors", TokenType.THEN],
  ["false", TokenType.FALSE],
  ["faux", TokenType.FALSE],
  ["true", TokenType.TRUE],
  ["vrai", TokenType.TRUE],
  ["si", TokenType.IF],
  ["if", TokenType.IF],
  ["end", TokenType.END],
  ["fin", TokenType.END],
  ["var", TokenType.VAR],
  ["do", TokenType.THEN],
  ["tantque", TokenType.WHILE],
  ["while", TokenType.WHILE],
  ["faire", TokenType.THEN],
  ["for", TokenType.FOR],
  ["pour", TokenType.FOR],
  ["between", TokenType.FROM],
  ["entre", TokenType.FROM],
  ["var", TokenType.VAR],
  ["fonction", TokenType.FUNCTION],
  ["function", TokenType.FUNCTION],
  [",", TokenType.COMMA],
  ["retourner", TokenType.RETURN],
  ["afficher", TokenType.PRINT],
]);

let source: string = "";
let tokens: Token[] = [];
let line = 1;
let cursor = 0;
let start = 0;
let lastLine = 0;

export function parseTokens(s: string): Token[] {
  // Reset state
  tokens = [];
  line = 1;
  cursor = 0;
  start = 0;
  lastLine = 0;

  source = s;
  while (!isEnd()) {
    start = cursor;
    scanToken();
  }

  addToken(TokenType.EOF);
  return tokens;
}

function scanToken() {
  const c = advance();
  switch (c) {
    case "\0":
      break;
    case "(":
      addToken(TokenType.LEFT_PAREN);
      break;
    case ")":
      addToken(TokenType.RIGHT_PAREN);
      break;
    case "{":
      addToken(TokenType.LEFT_BRACE);
      break;
    case "}":
      addToken(TokenType.RIGHT_BRACE);
      break;
    case "[":
      addToken(TokenType.LEFT_BRACKET);
      break;
    case "]":
      addToken(TokenType.RIGHT_BRACKET);
      break;
    case ",":
      addToken(TokenType.COMMA);
      break;
    case ".":
      addToken(TokenType.DOT);
      break;
    case "-":
      addToken(TokenType.MINUS);
      break;
    case "+":
      addToken(TokenType.PLUS);
      break;
    case ";":
      addToken(TokenType.SEMICOLON);
      break;
    case "*":
      addToken(TokenType.STAR);
      break;
    case "!":
      addToken(match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
      break;
    case "=":
      addToken(match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
      break;
    case "<":
      addToken(match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
      break;
    case ">":
      addToken(match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER);
      break;
    case "/":
      if (match("/")) {
        // Un commentaire s'étend jusqu'à la fin de la ligne.
        while (peek() !== "\n" && !isEnd()) advance();
      } else {
        addToken(TokenType.SLASH);
      }
      break;
    case " ":
    case "\r":
    case "\t":
      // Ignore whitespace.
      break;

    case "\n":
      line++;
      lastLine = start;
      break;
    case '"':
    case "'":
      string(c);
      break;
    default:
      if (isDigit(c)) {
        number();
      } else if (isAlpha(c)) {
        identifier();
      } else {
        throw new ParseError(`${c} inattendu`, [column(), column() + 1, line]);
      }
  }
}

/**
 * Reconnait un identifiant (variable, fonction, mot clef)
 */
function identifier() {
  while (isAlphaNumeric(peek())) {
    advance();
  }

  const text = source.substring(start, cursor);
  const keyword = Keywords.get(text.toLowerCase());

  // La chaine est un mot clef connu
  if (keyword) {
    addToken(keyword, text);
    return;
  }
  addToken(TokenType.IDENTIFIER, text);
}

/**
 * Reconnait une chaine de caractère
 */
function string(delimiter = '"') {
  // Avance tant qu'on ne rencontre pas un "
  while (peek() !== delimiter && !isEnd()) {
    if (peek() === "\n") {
      line++;
    }
    advance();
  }

  if (isEnd()) {
    throw new ParseError(
      `Chaine de caractère non fermée, ${delimiter} attendu`,
      [start, column() + cursor - start, line],
    );
  }

  // On avance au dela du guillemet fermant
  advance();
  addToken(TokenType.STRING, source.substring(start + 1, cursor - 1));
}

/**
 * Reconnait un nombre
 */
function number() {
  while (isDigit(peek())) {
    advance();
  }

  if (peek() === "." && isDigit(peek(2))) {
    // Consomme le "."
    advance();
    while (isDigit(peek())) {
      advance();
    }
  }

  addToken(TokenType.NUMBER, source.substring(start, cursor));
}

/**
 * Regarde le caractère suivant (lookahead)
 */
function peek(n = 1) {
  if (isEnd()) return "\0";
  return source.charAt(cursor + n - 1);
}

/**
 * Avance, mais de manière conditionnelle
 */
function match(expected: string): boolean {
  if (isEnd()) return false;
  if (source.charAt(cursor) !== expected) return false;

  cursor++;
  return true;
}

/**
 * Avance d'un cran vers l'avant
 */
function advance() {
  return source[cursor++];
}

/**
 * Le curseur est à la fin de la source
 */
function isEnd() {
  return cursor >= source.length;
}

/**
 * Pousse un nouveau token dans le lexer
 */
function addToken(type: TokenType, value?: string) {
  if (type === TokenType.NUMBER) {
    tokens.push({
      type: TokenType.NUMBER,
      value: parseFloat(
        value === undefined ? source.substring(start, cursor) : value,
      ),
      position: [start, cursor, line],
    });
    return;
  }
  tokens.push({
    type: type,
    value: value === undefined ? source.substring(start, cursor) : value,
    position: [start, cursor, line],
  });
}

function column(): number {
  return cursor - 1 - lastLine;
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

function isAlpha(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
}

function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDigit(c);
}
