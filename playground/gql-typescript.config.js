import { CLIConfig } from "../dist/cli";

const config = new CLIConfig({
  schema: "./playground/schema.graphql",
  watch: false,
});

export default config;
