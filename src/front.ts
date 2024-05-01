import {run} from "./runner.ts";

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
  try {
    code.innerText = `${run(textarea.value)}`;
    code.classList.remove("error");
  } catch (e) {
    code.classList.add("error");
    code.textContent = `${e}`;
    console.error(e);
  }
}, 500);

runCode();
textarea.addEventListener("input", runCode);
