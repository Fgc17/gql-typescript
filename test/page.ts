/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from "../src/client/client";

const operation = gql("query", {
  getUser: {
    birth_date: true,
    test: "test",
  },
});
