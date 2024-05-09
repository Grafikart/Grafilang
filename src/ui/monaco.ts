import { editor, languages, type Position } from "monaco-editor";
import { Keywords } from "../lang/lexer.ts";
import { colors } from "./colors.ts";
import ITextModel = editor.ITextModel;

export const langId = "grafilang";
languages.register({ id: langId });
const keywords = [
  ...Array.from(Keywords.keys()),
  ...Array.from(Keywords.keys()).map((v) => v.toUpperCase()),
];
languages.setLanguageConfiguration(langId, {
  brackets: [
    ["[", "]"],
    ["(", ")"],
  ],

  comments: {
    lineComment: "//",
  },

  autoClosingPairs: [
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
});
languages.setMonarchTokensProvider(langId, {
  keywords,
  tokenizer: {
    root: [
      [/\/\/.*/, "comment"],
      [/[+\-/*!<>=%]/, "delimiter"],
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@keywords": { token: "keyword.$0" },
            "@default": "identifier",
          },
        },
      ],
      [/\d/, "number"],
      [/[ \t\r\n]+/, ""],
      [/[{}()\[\]]/, "bracket"],
      [/"[^"]*"/, "string"],
      [/'[^']*'/, "string"],
    ],
  },
});
languages.registerCompletionItemProvider(langId, {
  provideCompletionItems(
    model: ITextModel,
    position: Position,
  ): languages.ProviderResult<languages.CompletionList> {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    return {
      suggestions: [
        [
          "FONCTION",
          `FONCTION \${1:nom}($2)
  $3
FIN`,
        ],
        ["AFFICHER", `AFFICHER $1`],
        [
          "SI",
          `SI \${1:condition} ALORS
  $2
FIN`,
        ],
        [
          "POUR",
          `POUR I ENTRE $1 ET $2
   $3
FIN`,
        ],
      ].map(([label, insertText]) => ({
        label,
        insertText,
        kind: languages.CompletionItemKind.Keyword,
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      })),
    };
  },
});
editor.defineTheme("tokyonight", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: colors.variable },
    { token: "keyword", foreground: colors.keyword, fontStyle: "bold" },
    { token: "string", foreground: colors.string },
    { token: "number", foreground: colors.number },
    { token: "delimiter", foreground: colors.delimiter },
    { token: "bracket", foreground: colors.bracket },
    { token: "comment", foreground: colors.comment },
  ],
  colors: {
    ["editor.background"]: colors.background,
    ["editor.foreground"]: colors.text,
  },
});
editor.setTheme("tokyonight");
