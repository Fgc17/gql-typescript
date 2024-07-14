import path from "path";
import { cwd } from "process";
import WebSocket from "ws";

export const generatedTypesFolder = path.join(
  cwd(),
  "node_modules",
  "@ferstack",
  "generated",
  "gql-typescript"
);

export function restartTsServer(vscodeRemote: string) {
  const ws = new WebSocket(vscodeRemote);

  ws.on("open", function open() {
    const command = { command: "typescript.restartTsServer" };
    ws.send(JSON.stringify(command));
  });

  ws.on("error", function error() {
    console.log(
      `VSCode remote server not found at ${vscodeRemote}, if this was expected, you can disable this message by setting vscodeRemote to null in your config file.`
    );

    ws.close();
  });
}
