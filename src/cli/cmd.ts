#!/usr/bin/env node
import fs from "fs";
import { generator } from "./generator.js";
import path from "path";
import { cwd } from "process";
import { generate } from "@graphql-codegen/cli";
import { program } from "commander";
import { watchSchema } from "./watcher.js";

program
  .name("gql-tsquery")
  .description("Generate typescript types from a graphql schema");

program.option("--watch");

program.parse();

const generatedNodemodulesPath = path.join(
  cwd(),
  "node_modules",
  "@ferstack",
  "generated",
  "gql-tsquery"
);

const schemaPath = program.args[0];

if (!schemaPath) {
  console.error("Please provide a schema path");
  process.exit(1);
}

const cmd = () =>
  generate(
    {
      schema: schemaPath,
      generates: {
        [generatedNodemodulesPath + "/temp/types.ts"]: {
          plugins: ["typescript"],
        },
        [generatedNodemodulesPath + "/temp/schema.gql"]: {
          plugins: ["schema-ast"],
        },
      },
      debug: false,
      silent: true,
      verbose: false,
      errorsOnly: true,
    },
    false
  )
    .then((files: Array<{ filename: string; content: string }>) => ({
      schema: files.find((file) => file.filename.endsWith("schema.gql"))!
        .content,
      tsTypes: files.find((file) => file.filename.endsWith("types.ts"))!
        .content,
    }))
    .then(({ schema, tsTypes }) => generator(schema, tsTypes))
    .then((schema) =>
      fs.writeFileSync(generatedNodemodulesPath + "/types.ts", schema)
    );

const shouldWatch = program.opts().watch;

if (shouldWatch) {
  console.log("🌐 gql-tsquery: ✓ Watching for changes...");

  watchSchema(schemaPath, cmd);
} else {
  console.log("🌐 gql-tsquery: ✓ Generated Types.");

  cmd();
}
