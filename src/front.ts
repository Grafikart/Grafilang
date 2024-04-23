import {ASTBuilder} from "./ast.ts";
import {Lexer} from "./lexer.ts";

const textarea = document.querySelector('textarea')!
const code = document.querySelector('code')!

export function debounce<T extends (...args: any[]) => any>(cb: T, wait: number) {
    let h: ReturnType<typeof setTimeout>;
    const callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return <T>(callable);
}

const parseLang = debounce(() => {
    try {
        const astTree = new ASTBuilder(Lexer.parse(textarea.value)).getTree()
        console.clear()
        console.log(astTree)
        code.classList.remove('error')
        code.textContent = JSON.stringify(astTree, null, 2)
    } catch (e) {
        code.classList.add('error')
        code.textContent = `${e}`
    }
}, 500)

parseLang()
textarea.addEventListener('input', parseLang)



