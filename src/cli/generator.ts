import {
  buildSchema,
  GraphQLSchema,
  isNonNullType,
  isListType,
  isNamedType,
  GraphQLField,
} from "graphql";

export const generator = async (
  schemaStr: string,
  tsTypesStr: string
): Promise<string> => {
  const schema: GraphQLSchema = buildSchema(schemaStr);

  const typesMap = extractTypes(tsTypesStr);

  const operationsInterface = generateOperationsInterface(schema, typesMap);

  const operationsConst = generateOperationsConst(schema);

  const types =
    tsTypesStr +
    "\n\n" +
    `export interface Operations ${JSON.stringify(operationsInterface, null, 2).replace(/["]/g, "")}\n` +
    `export const operations = ${JSON.stringify(operationsConst, null, 2)}`;

  return types;
};

const extractTypes = (output: string): any => {
  const typePattern = /export type (\w+) = {[\s\S]*?};/g;
  const types: any = {};
  let match: RegExpExecArray | null;

  while ((match = typePattern.exec(output)) !== null) {
    const typeName = match[1]!;
    types[typeName] = typeName;
  }

  return types;
};

const generateOperationsInterface = (
  schema: GraphQLSchema,
  typesMap: any
): any => {
  const operations: any = {
    query: {},
    mutation: {},
  };

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();

  if (queryType) {
    Object.keys(queryType.getFields()).forEach((fieldName) => {
      const field = queryType.getFields()[fieldName]!;
      operations.query[fieldName] = {
        returnType: `Query['${fieldName}']`,
        selectType: getNamedType(field.type),
        variablesType: getArgsType(queryType.name, fieldName, typesMap),
      };
    });
  }

  if (mutationType) {
    Object.keys(mutationType.getFields()).forEach((fieldName) => {
      const field = mutationType.getFields()[fieldName]!;
      operations.mutation[fieldName] = {
        returnType: `Mutation['${fieldName}']`,
        selectType: getNamedType(field.type),
        variablesType: getArgsType(mutationType.name, fieldName, typesMap),
      };
    });
  }

  return operations;
};

const getNamedType = (type: any): string => {
  if (isNonNullType(type) || isListType(type)) {
    return getNamedType(type.ofType);
  }
  if (isNamedType(type)) {
    return type.name;
  }
  return "";
};

const getArgsType = (
  parentName: string,
  fieldName: string,
  typesMap: any
): string => {
  const typeName = `${parentName}${fieldName}args`;

  const typeMapKeys = Object.keys(typesMap);

  const lowercaseTypeMapKeys = typeMapKeys.map((key) => key.toLowerCase());

  const lowercaseTypeName = typeName.toLowerCase();

  const matchedTypeIndex = lowercaseTypeMapKeys.findIndex(
    (key) => key === lowercaseTypeName
  );

  return matchedTypeIndex !== -1
    ? typesMap[typeMapKeys[matchedTypeIndex]!]
    : "null";
};

function extractVariables(field: GraphQLField<any, any, any>) {
  const variables = {} as any;
  field.args.forEach((arg) => {
    return (variables[arg.name] = arg.type.toString());
  });
  return variables;
}

function generateOperationsConst(schema: GraphQLSchema) {
  const operations: any = {
    query: {},
    mutation: {},
  };

  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();

  if (queryType) {
    const fields = queryType.getFields();
    for (const fieldName in fields) {
      const field = fields[fieldName]!;
      operations.query[fieldName] = { variables: extractVariables(field) };
    }
  }

  if (mutationType) {
    const fields = mutationType.getFields();
    for (const fieldName in fields) {
      const field = fields[fieldName]!;
      operations.mutation[fieldName] = { variables: extractVariables(field) };
    }
  }

  return operations;
}
