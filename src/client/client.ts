import gqlTag from "graphql-tag";
import {
  Operations,
  operations,
} from "@ferstack/generated/gql-tsquery/types.js";
import { Defined, MapFields, SelectQuery, UnionToObject } from "./types.js";
import _ from "lodash";
import { DocumentNode } from "graphql";

export type OperationType = keyof Operations;

export type FlattedOperations<TOperationType extends OperationType> =
  UnionToObject<Operations[TOperationType]>;

export type GroupOperations<
  TOperationType extends OperationType,
  TBy extends "variablesType" | "returnType" | "selectType",
  TOperations extends
    FlattedOperations<TOperationType> = FlattedOperations<TOperationType>,
> = {
  [P in keyof TOperations]: TOperations[P] extends {
    [k in TBy]: infer R;
  }
    ? R
    : never;
};

export type GQLSelect<
  TOperationType extends OperationType,
  TOperations extends GroupOperations<
    TOperationType,
    "selectType"
  > = GroupOperations<TOperationType, "selectType">,
> = {
  [K in keyof TOperations]?: SelectQuery<TOperations[K]>;
};

export type GQLRequest<
  TOperationType extends OperationType,
  TSelect extends GQLSelect<TOperationType>,
> = {
  documentNode: DocumentNode;
  variables: (variables: VariablesInputType<TOperationType>) => any;
  _returnType: Defined<
    MapFields<TSelect, GroupOperations<TOperationType, "returnType">>
  >;
  _variablesType: VariablesInputType<TOperationType>;
};

export const gql = <TOperationType extends OperationType>(
  operationType: TOperationType,
  select: GQLSelect<TOperationType>
) => {
  const buildFields = (fields: any): string => {
    return Object.keys(fields)
      .map((key) => {
        if (typeof fields[key] === "object") {
          return `${key} { ${buildFields(fields[key])} }`;
        }
        return key;
      })
      .join(" ");
  };

  const operationData = Object.keys(select).map((operationName) => {
    const fields = select[operationName as keyof typeof select];
    const operationConfig = (operations as any)[operationType][operationName];
    const variableDefinitions = Object.keys(operationConfig.variables)
      .map(
        (key) =>
          `$${operationName}${_.capitalize(key)}: ${
            operationConfig.variables[key]
          }`
      )
      .join(", ");

    const variableAssignments = Object.keys(operationConfig.variables)
      .map((key) => `${key}: $${operationName}${_.capitalize(key)}`)
      .join(", ");

    return {
      name: operationName,
      variableDefinitions,
      variableAssignments,
      fields: buildFields(fields),
    };
  });

  const variableDefinitionsString = operationData
    .map((op) => op.variableDefinitions)
    .filter(Boolean)
    .join(", ");

  const queryString = `
    ${operationType as string} GraphqlQuery(${
      variableDefinitionsString ? `${variableDefinitionsString}` : ""
    }) {
      ${operationData
        .map(
          (op) => `
        ${op.name}${
          op.variableAssignments ? `(${op.variableAssignments})` : ""
        } {
          ${op.fields}
        }
      `
        )
        .join("\n")}
    }
  `;

  const documentNode = gqlTag(queryString);

  return {
    documentNode,
    variables,
    _variablesType: null as any,
    _returnType: null as any,
  } as any as GQLRequest<TOperationType, typeof select>;
};

export type VariablesInputType<
  TOperationType extends OperationType,
  TOperationByVariables extends GroupOperations<
    TOperationType,
    "variablesType"
  > = GroupOperations<TOperationType, "variablesType">,
> = {
  [k in keyof TOperationByVariables]?: Defined<TOperationByVariables[k]>;
};

export const variables = <TOperationType extends OperationType>(
  variables: VariablesInputType<TOperationType>
) =>
  Object.entries(variables).reduce((acc: any, [key, value]: any) => {
    const valueEntries = Object.entries(value);

    for (const [valueKey, valueValue] of valueEntries) {
      acc[`${key}${_.capitalize(valueKey)}`] = valueValue;
    }

    return acc;
  }, {});
