import { run } from "./src/runner";

console.log(run(await Bun.file("./script.glang").text()));
