/* eslint-disable @typescript-eslint/no-unused-vars */
import { GQLSelect, gql } from "../src/client/client";

const rest = null as any;

const query = gql("mutation", {
  createPhysicalEvaluation: {
    data: {
      height: true,
      imc: true,
    },
  },
});
