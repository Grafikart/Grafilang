import { run } from "./src/runner";

run(await Bun.file("./script.glang").text());
