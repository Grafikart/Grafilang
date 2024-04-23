import { TokenType, type Token } from "./lexer.ts"
import {SyntaxError} from "./errors.ts";

type Program = {
    type: 'Program',
    body: Statement[]
}

type ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: Expression
}

type Identifier = {
    type: 'Identifier'
    name: string
}
type Literal = {
    type: 'Literal'
    value: string | number
}

type AssignmentExpression = {
    type: "AssignmentExpression",
    left: Identifier,
    right: Expression
}

type BinaryExpression = {
    type: "BinaryExpression",
    operator: string,
    left: Expression,
    right: Expression
}

type Statement = ExpressionStatement
type Node = Identifier | Literal
type Expression = AssignmentExpression | BinaryExpression | Literal | Identifier

export class ASTBuilder {

    #tokens: Token[] = []

    constructor(tokens: Token[]) {
        this.#tokens = tokens
    }

    getTree (): Program {
        return {
            type: 'Program',
            body: [
                this.#buildStatement(0)
            ]
        }
    }

    #buildStatement (index: number): Statement  {
        const currentToken = this.#tokens[index]
        const nextToken = this.#tokens[index + 1]
        if (currentToken.type === TokenType.Identifier) {
            if (!nextToken || nextToken.type !== TokenType.Operator || nextToken.value !== '=') {
                throw new SyntaxError(nextToken, `après "${currentToken.value}"`)
            }
            return {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    left: {
                        type: 'Identifier',
                        name: currentToken.value
                    },
                    right: this.#buildExpression(index + 2)
                },
            }
        }

        return {} as any
    }

    #buildExpression (index: number): Expression {
        const currentToken = this.#tokens[index]
        const nextToken = this.#tokens[index + 1]
        if (nextToken.value === '=') {
        }
        if (nextToken.type === TokenType.Operator) {
            return {
                type: 'BinaryExpression',
                operator: nextToken.value,
                left: this.#buildNode(currentToken),
                right: this.#buildExpression(index + 2)
            }
        }
        return this.#buildNode(currentToken)
    }

    #buildNode (token: Token): Node {
        if (token.type === TokenType.Identifier) {
            return {
                type: 'Identifier',
                name: token.value
            }
        }
        if (token.type === TokenType.Literal) {
            return {
                type: 'Literal',
                value: token.value
            }
        }
        throw new Error("Cannot convert " + token.type + " into a Node")
    }


}
