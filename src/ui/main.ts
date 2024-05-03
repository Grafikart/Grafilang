import "./monaco.ts";
import { editor as MonacoEditor } from "monaco-editor/esm/vs/editor/editor.api";
import "./main.css";
import { interpret } from "../lang/interpreter.ts";
import { CodeError } from "../lang/errors.ts";
import { debounce } from "./timer.ts";
import { StdOut } from "../lang/type.ts";

const source = document.querySelector("textarea")!.value;
const editorWrapper: HTMLDivElement = document.querySelector(".editor")!;
const code = document.querySelector("code")!;

const editor = MonacoEditor.create(editorWrapper, {
  value: source,
  language: "grafilang",
  minimap: { enabled: false },
  theme: "vs-dark",
  scrollBeyondLastLine: false,
  fontSize: 14,
  scrollbar: {
    verticalScrollbarSize: 5,
    verticalSliderSize: 3,
    horizontalScrollbarSize: 5,
    horizontalSliderSize: 3,
  },
});

const stdOut: StdOut = {
  push: (s: string) => (code.innerText += `${s}\n`),
  clear: () => code.innerText,
};

const onChange = debounce(() => {
  const source = editor.getModel()?.getValue() ?? "";
  try {
    code.classList.remove("error");
    interpret(source, stdOut);
  } catch (e) {
    code.classList.add("error");
    if (e instanceof CodeError) {
      code.textContent = e.withSource(source);
    } else {
      code.textContent = `${e}`;
    }
  }
}, 500);

editor.onDidChangeModelContent(onChange);
onChange();
