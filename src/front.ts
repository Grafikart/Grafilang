import { interpret } from "./interpreter.ts";
import { CodeError } from "./errors.ts";

const textarea = document.querySelector("textarea")!;
const code = document.querySelector("code")!;

export function debounce<T extends (...args: any[]) => any>(
  cb: T,
  wait: number,
) {
  let h: ReturnType<typeof setTimeout>;
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>callable;
}

const runCode = debounce(() => {
  const source = textarea.value;
  try {
    code.innerText = `${interpret(source)}`;
    code.classList.remove("error");
  } catch (e) {
    code.classList.add("error");
    if (e instanceof CodeError) {
      code.textContent = e.withSource(source);
    } else {
      code.textContent = `${e}`;
    }
  }
}, 500);

runCode();
textarea.addEventListener("input", runCode);
