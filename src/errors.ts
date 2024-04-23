import {Token} from "./lexer.ts";

export class SyntaxError extends Error {

    constructor(token: Token, message: string = '') {
        super(`Erreur de Syntaxe : "${token.value}" inattendu ${message} (ligne ${token.line}, colonne ${token.start})`);
    }

}
