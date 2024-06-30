interface Config {
  watch: boolean;
  schema: string;
  vscodeRemote?: string;
}

export class CLIConfig {
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    if (!this.config.vscodeRemote)
      this.config.vscodeRemote = "ws://localhost:3710";
  }

  get watch() {
    return this.config.watch;
  }

  get schema() {
    return this.config.schema;
  }

  get vscodeRemote() {
    return this.config.vscodeRemote!;
  }
}
