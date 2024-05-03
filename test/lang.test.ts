import { describe, expect, test } from "vitest";
import { interpret } from "../src/lang/interpreter";
import { ParseError, RuntimeError } from "../src/lang/errors";

describe("Grafilang", () => {
  const run = (source: string) => {
    let out: string[] = [];
    const stdOut = {
      push: (s: string) => out.push(s),
      clear: () => (out = []),
    };
    interpret(source, stdOut);
    return out;
  };

  test.each([
    ["1+2", "3"],
    ['"Bonjour " + "John"', "Bonjour John"],
    [`'Bonjour ' + 'John'`, "Bonjour John"],
    ["1 + 2 * 3", "7"],
  ])("comprend les expressions simples %s -> %s", (code, expected) => {
    expect(run("afficher(" + code + ")")).toEqual([expected]);
  });

  test("détecte la non fermeture d'une chaine", () => {
    expect(() =>
      run(`
            afficher("Bonjour " + " John)
        `),
    ).toThrowError(ParseError);
  });

  test("permet la création de variable", () => {
    expect(
      run(`
            VAR A = 3 + 2
            afficher(A)
        `),
    ).toEqual(["5"]);

    expect(() =>
      run(`
            VAR A = 3 + 2
            VAR A = 2
            afficher(A)
        `),
    ).toThrowError(RuntimeError);
  });

  test("une variable ne peut être redéclaré", () => {
    expect(() =>
      run(`
            VAR A = 3 + 2
            VAR A = 2
            afficher(A)
        `),
    ).toThrowError(RuntimeError);
  });

  test("une variable peut être réassigné", () => {
    expect(
      run(`
            VAR A = 3 + 2
            A = 1
            afficher(A)
        `),
    ).toEqual(["1"]);
  });

  test("une variable doit exister pour être assigné", () => {
    expect(() =>
      run(`
            A = 2
            afficher(A)
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
            afficher(A)
        `),
    ).toEqual(["2"]);
  });

  test.each([
    [4, "plus de 2"],
    [1, "moins de 2"],
  ])(`comprend les conditions A=%s -> %s`, (v: number, expected: string) => {
    expect(
      run(`
            VAR A = ${v}
            SI A > 2 ALORS
                afficher("plus de 2")
            SINON
                afficher("moins de 2")
            FIN
        `),
    ).toEqual([expected]);
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
    expect(run(`afficher(${code})`)).toEqual([expected]);
  });

  test(`les boucles "while" sont supportées`, () => {
    expect(
      run(`
        VAR A = 1
        TANTQUE A <= 3 FAIRE
            afficher(A)
            A = A + 1
        FIN
        `),
    ).toEqual(["1", "2", "3"]);
  });

  test(`les boucles "for" sont supportées`, () => {
    expect(
      run(`POUR K ENTRE 1 ET 3 FAIRE
           afficher(K)
        FIN`),
    ).toEqual(["1", "2", "3"]);
  });

  test(`on peut déclarer des fonctions`, () => {
    expect(
      run(`
fonction count(n)
  si n > 1 alors
        count(n - 1)
  fin
  afficher(n)
fin

count(3)`),
    ).toEqual(["1", "2", "3"]);
  });

  test(`une fonction peut renvoyer une valeure`, () => {
    expect(
      run(`
fonction double(n)
    retourner n * 2
fin

afficher(double(3))`),
    ).toEqual(["6"]);
  });
});
