export enum TokenType {
    Number = "Number",
    Identifier = "Identifier",
    Literal = "Literal", // 2 3 "music"
    Operator = "Operator", // + < -
    Separator = "Separator", // }, (, ;
    Keyword = "Keyword" // if, while, return
}

export type Token = {
    type: TokenType,
    value: string,
    start: number,
    end: number,
    line: number
}

const operators = ['+', '<', '>', '-', '*', '=']
const spaces = ['\n', '\t', '\r', ' ']
const quotes = ['"', "'", "`"]
const separators = ['{', '}', '(', ')', '[', ']']
const keywords = ["si", "alors", "faire", "do", "if", "tanque", "for", "pourchaque", "foreach", "sinon", "else", "fin", "end"]
const breaks = [
    ...operators,
    ...separators,
    ...spaces
]

export class Lexer {

    #line = 0
    #column = 0
    #charIndex = 0
    #str = ''
    #tokens: Token[] = []

    static parse (str: string) {
        return new Lexer().parse(str)
    }

    parse (str: string) {
        this.#str = str
        this.#column = 0
        this.#line = 0
        this.#charIndex = 0
        this.#tokens = []

        while(this.#charIndex < this.#str.length) {
            const char = this.#str[this.#charIndex]
            if (separators.includes(char)) {
                this.#pushToken(TokenType.Separator, 1)
            } else if (operators.includes(char)) {
                this.#pushOperator()
            } else if (char === "\n") {
                this.#nextLine()
            } else if (quotes.includes(char)) {
                this.#pushQuotedLiteral(char)
            } else if (quotes.includes(char)) {
                this.#pushQuotedLiteral(char)
            } else if (isNumber(char)) {
                this.#pushNumber()
            } else if (isLetter(char)) {
                this.#pushIdentifier()
            } else {
                this.#nextChar()
            }
        }

        return this.#tokens
    }

    #pushOperator() {
        let operatorLength = 1
        if (['>=', '<=', '=='].includes(this.#str.slice(this.#charIndex, this.#charIndex + 2))) {
            operatorLength = 2
        }
        this.#pushToken(TokenType.Operator, operatorLength)
    }

    /**
     * Enregistre un nouveau token
     */
    #pushToken (type: TokenType, length: number) {
        this.#tokens.push({
            type,
            value: this.#str.slice(this.#charIndex, this.#charIndex + length),
            start: this.#column,
            end: this.#column + length,
            line: this.#line
        })
        this.#column += length
        this.#charIndex += length
    }

    /**
     * Détecte les chaine de caractère (entre quillemet)
     */
    #pushQuotedLiteral(quote: string) {
        let i = this.#charIndex + 1
        while (i < this.#str.length) {
            // We encountered the end of the quoted string
            if(this.#str[i] === quote && this.#str[i - 1] !== "\\") {
                break;
            }
            i++
        }
        this.#pushToken(TokenType.Literal, i - this.#charIndex + 1)
    }

    #pushIdentifier() {
        let i = this.#charIndex + 1;
        while (i < this.#str.length) {
            if (!isIdentifierCharacter(this.#str[i])) {
                break;
            }
            i++
        }
        const str = this.#str.slice(this.#charIndex, i)
        this.#pushToken(keywords.includes(str.toLowerCase()) ? TokenType.Keyword : TokenType.Identifier, i - this.#charIndex)
    }

    #pushNumber() {
        let i = this.#charIndex + 1;
        while (i < this.#str.length) {
            if (!isNumber(this.#str[i])) {
                break;
            }
            i++
        }
        this.#pushToken(TokenType.Literal, i - this.#charIndex)
    }

    #nextChar () {
        this.#column++
        this.#charIndex++
    }

    #nextLine () {
        this.#column = 0
        this.#charIndex++
        this.#line++
    }


}

function isLetter(str: string): boolean {
    const code = str.toLowerCase().charCodeAt(0)
    return code >= 97 && code <= 122
}

function isNumber(str: string): boolean {
    const code = str.charCodeAt(0)
    return code >= 48 && code <= 57
}

function isIdentifierCharacter(str: string): boolean {
    return isLetter(str) || str === '_' || isNumber(str)
}