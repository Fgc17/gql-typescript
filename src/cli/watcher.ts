import fs from "fs";
import chokidar from "chokidar";
import axios from "axios";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { getIntrospectionQuery } from "graphql";

const isUrl = (pattern: string): boolean => {
  try {
    new URL(pattern);
    return true;
  } catch {
    return false;
  }
};

const fetchRemoteSchema = async (url: string): Promise<string> => {
  const response = await axios.post(
    url,
    {
      query: getIntrospectionQuery(),
    },
    {
      headers: {
        "x-apollo-operation-name": "IntrospectionQuery",
      },
    }
  );
  return response.data;
};

const fetchLocalSchema = async (path: string): Promise<string> => {
  return await readFile(path, "utf-8");
};

export const watchSchema = (
  pattern: string,
  callback: (schema: string) => void
): void => {
  if (isUrl(pattern)) {
    let previousSchema = "";
    const fetchAndUpdate = async () => {
      try {
        const schema = await fetchRemoteSchema(pattern);
        if (schema !== previousSchema) {
          previousSchema = schema;
          callback(schema);
        }
      } catch (error) {
        setTimeout(() => {
          fetchAndUpdate();
        }, 3000);
      }
    };

    fetchAndUpdate();
    setInterval(fetchAndUpdate, 1500); // Check every 10 seconds
  } else {
    const watcher = chokidar.watch(pattern, { persistent: true });

    const updateSchema = async () => {
      try {
        const schema = await fetchLocalSchema(pattern);
        callback(schema);
      } catch (error) {
        console.error("Failed to read schema:", error);
      }
    };

    watcher.on("change", updateSchema);
    watcher.on("add", updateSchema);
  }
};
