import {describe, test, expect} from "vitest";
import {interpret} from "../src/interpreter";
import {buildASTTree} from "../src/ast";
import {parseTokens} from "../src/lexer";
import {ParseError, RuntimeError} from "../src/errors";

describe('Grafilang', () => {
    const run = (source: string) => {
        return interpret(buildASTTree(parseTokens(source)))
    }

    test.each([
        ['1+2', "3"],
        ['"Bonjour " + "John"', "Bonjour John"],
        [`'Bonjour ' + 'John'`, "Bonjour John"],
        ['1 + 2 * 3', "7"],
    ])('%s -> %s', (code, expected) => {
        expect(run("AFFICHER " + code)).toBe(expected)
    })

    test('détecte la non fermeture d\'une chaine', () => {
        expect(() => run(`
            AFFICHER "Bonjour " + " John
        `)).toThrowError(ParseError)
    })

    test('permet la création de variable', () => {
        expect(run(`
            VAR A = 3 + 2
            AFFICHER A
        `)).toBe('5')

        expect(() => run(`
            VAR A = 3 + 2
            VAR A = 2
            AFFICHER A
        `)).toThrowError(RuntimeError)
    })

    test('une variable ne peut être redéclaré', () => {
        expect(() => run(`
            VAR A = 3 + 2
            VAR A = 2
            AFFICHER A
        `)).toThrowError(RuntimeError)
    })

    test('une variable peut être réassigné', () => {
        expect(run(`
            VAR A = 3 + 2
            A = 1
            AFFICHER A
        `)).toBe('1')
    })

    test('une variable doit exister pour être assigné', () => {
        expect(() => run(`
            A = 2
            AFFICHER A
        `)).toThrowError(RuntimeError)
    })

    test('une variable peut être assignée dans un block', () => {
        expect(run(`
            VAR A = 2
            {
                VAR A = 3
            }
            AFFICHER A
        `)).toBe("2")
    })
})
