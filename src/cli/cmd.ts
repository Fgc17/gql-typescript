#!/usr/bin/env node
import chokidar from "chokidar";
import fs from "fs";
import { sync } from "glob";
import { generator } from "./generator.js";
import path from "path";
import { cwd } from "process";

const generatedNodemodulesPath = path.join(
  cwd(),
  "node_modules",
  "@ferstack",
  "generated",
  "gql-tsquery"
);

function generateFile(filePath: string) {
  const schema = fs.readFileSync(filePath, "utf8");
  generator(schema)
    .then((o) => fs.writeFileSync(generatedNodemodulesPath + "/types.ts", o))
    .catch(console.log);
}

const schemaFilePattern = process.argv[2];

if (!schemaFilePattern) {
  console.error("Please provide a schema file pattern.");
  process.exit(1);
}

const schemaPaths = sync(schemaFilePattern);

if (schemaPaths.length === 0) {
  console.error(`No files found matching pattern: ${schemaFilePattern}`);
  process.exit(1);
}

const watcher = chokidar.watch(schemaPaths, {
  persistent: true,
});

for (const schemaPath of schemaPaths) {
  generateFile(schemaPath);
}

watcher.on("change", (schemaPath) => {
  generateFile(schemaPath);
});

watcher.on("error", (error) => {
  console.error(`Watcher error: ${error}`);
});

console.log(`Watching for changes in ${schemaPaths.join(", ")}`);
