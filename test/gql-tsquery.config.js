import { CLIConfig } from "../dist/cli";

const config = new CLIConfig({
  schema: "./test/schema.graphql",
  watch: true,
});

export default config;
