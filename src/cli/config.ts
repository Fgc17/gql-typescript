interface Config {
  watch: boolean;
  schema: string;
  editorRemote?: string;
}

export class CLIConfig {
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    if (!this.config.editorRemote)
      this.config.editorRemote = "ws://localhost:3710";
  }

  get watch() {
    return this.config.watch;
  }

  get schema() {
    return this.config.schema;
  }

  get editorRemote() {
    return this.config.editorRemote!;
  }
}
