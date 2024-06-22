import { gql } from "../src/client/client";
import { request } from "graphql-request";

const operation = gql("query", {
  getUsers: {
    full_name: true,
    info: {
      education_level: true,
    },
  },
  getUser: {
    cpf: true,
  },
});
