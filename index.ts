import { ASTBuilder } from "./src/ast.ts";
import {Lexer} from "./src/lexer.ts";

const script = await Bun.file('./script.glang').text()
console.log('=========')
console.log(JSON.stringify(
    new ASTBuilder(Lexer.parse(script)).getTree(),
    null,
    2
))


