import { describe, expect, test } from "vitest";
import { interpret } from "../src/lang/interpreter";
import { ParseError, RuntimeError } from "../src/lang/errors";

describe("Grafilang", () => {
  const run = (source: string) => {
    return interpret(source);
  };

  test.each([
    ["1+2", "3"],
    ['"Bonjour " + "John"', "Bonjour John"],
    [`'Bonjour ' + 'John'`, "Bonjour John"],
    ["1 + 2 * 3", "7"],
  ])("comprend les expressions simples %s -> %s", (code, expected) => {
    expect(run("AFFICHER " + code)).toBe(expected);
  });

  test("détecte la non fermeture d'une chaine", () => {
    expect(() =>
      run(`
            AFFICHER "Bonjour " + " John
        `),
    ).toThrowError(ParseError);
  });

  test("permet la création de variable", () => {
    expect(
      run(`
            VAR A = 3 + 2
            AFFICHER A
        `),
    ).toBe("5");

    expect(() =>
      run(`
            VAR A = 3 + 2
            VAR A = 2
            AFFICHER A
        `),
    ).toThrowError(RuntimeError);
  });

  test("une variable ne peut être redéclaré", () => {
    expect(() =>
      run(`
            VAR A = 3 + 2
            VAR A = 2
            AFFICHER A
        `),
    ).toThrowError(RuntimeError);
  });

  test("une variable peut être réassigné", () => {
    expect(
      run(`
            VAR A = 3 + 2
            A = 1
            AFFICHER A
        `),
    ).toBe("1");
  });

  test("une variable doit exister pour être assigné", () => {
    expect(() =>
      run(`
            A = 2
            AFFICHER A
        `),
    ).toThrowError(RuntimeError);
  });

  test("une variable peut être assignée dans un block", () => {
    expect(
      run(`
            VAR A = 2
            {
                VAR A = 3
            }
            AFFICHER A
        `),
    ).toBe("2");
  });

  test.each([
    [4, "plus de 2"],
    [1, "moins de 2"],
  ])(`comprend les conditions A=%s -> %s`, (v: number, expected: string) => {
    expect(
      run(`
            VAR A = ${v}
            SI A > 2 ALORS
                AFFICHER "plus de 2"
            SINON
                AFFICHER "moins de 2"
            FIN
        `),
    ).toBe(expected);
  });

  test.each([
    ["TRUE ET TRUE", "true"],
    ["FALSE ET TRUE", "false"],
    ["TRUE OR TRUE", "true"],
    ["FALSE OR TRUE", "true"],
    ["FALSE OR FALSE", "false"],
    ["TRUE OR FALSE AND FALSE", "true"],
    ["(TRUE OR FALSE) AND FALSE", "false"],
  ])("comprend les opérateurs logiques %s -> %s", (code, expected) => {
    expect(run("AFFICHER " + code)).toBe(expected);
  });

  test(`les boucles "while" sont supportées`, () => {
    expect(
      run(`
        VAR A = 1
        TANTQUE A <= 3 FAIRE
            AFFICHER A
            A = A + 1
        FIN
        `),
    ).toBe("1\n2\n3");
  });

  test(`les boucles "for" sont supportées`, () => {
    expect(
      run(`POUR K ENTRE 1 ET 3 FAIRE
           AFFICHER K
        FIN`),
    ).toBe("1\n2\n3");
  });
});
