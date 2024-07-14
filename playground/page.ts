/* eslint-disable @typescript-eslint/no-unused-vars */
import { GQLSelect, gql } from "../src/client/client";

const rest = null as any;

const operation = gql("mutation", {
  createPhysicalEvaluation: {
    data: {
      height: true,
    },
    errors: {
      message: true,
      path: true,
    },
  },
});
