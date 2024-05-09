import { compileFromFile } from "json-schema-to-typescript";

compileFromFile("challenge.schema.json", {
  additionalProperties: false,
  customName: (schema) => {
    if ("$schema" in schema) {
      return "ChallengeDefinition";
    }
    return undefined;
  },
}).then((v) => Bun.write("src/type.challenge.ts", v));
