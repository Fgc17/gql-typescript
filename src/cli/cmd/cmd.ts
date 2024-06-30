#!/usr/bin/env node
import fs from "fs";
import { generator } from "../generator.js";
import path from "path";
import { cwd } from "process";
import { generate } from "@graphql-codegen/cli";
import { program } from "commander";
import { watchSchema } from "../watcher.js";
import { CLIConfig } from "../config.js";
import { generatedTypesFolder, restartTsServer } from "./utils.js";
import * as logging from "./logging.js";

program
  .name("gql-tsquery")
  .description("Generate typescript typesafe queries from a graphql schema");

program.option("--config <type>", "config path");

program.parse();

import(path.join(cwd(), program.opts().config ?? "gql-tsquery.config.js")).then(
  (file: { default: { config: CLIConfig } }) => {
    const config = file.default.config;

    const cmd = () =>
      generate(
        {
          schema: config.schema,
          generates: {
            [generatedTypesFolder + "/temp/types.ts"]: {
              plugins: ["typescript"],
              config: {
                scalars: {
                  DateTime: "string",
                },
              },
            },
            [generatedTypesFolder + "/temp/schema.gql"]: {
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
        .then((files: Array<{ filename: string; content: string }>) => {
          const endsWith = (filename: string) =>
            files.find((file) => file.filename.endsWith(filename))!;

          const schema = endsWith("schema.gql").content!;

          const tsTypes = endsWith("types.ts").content!;

          return generator(schema, tsTypes);
        })
        .then((schema) =>
          fs.writeFile(generatedTypesFolder + "/types.ts", schema, () =>
            restartTsServer(config.vscodeRemote)
          )
        );

    const shouldWatch = config.watch;

    cmd();

    if (!shouldWatch) {
      logging.generatedTypes();
      process.exit(0);
    }

    logging.watching();

    watchSchema(config.schema, cmd);
  }
);
