# @ferstack/gql-typescript

## Metadata

**Author:** Fernando Coelho

**License:** MIT

## Description

An agnostic GraphQL query builder bundled with a generator. This package provides a flexible way to build GraphQL queries in TypeScript, leveraging type safety and automatic generation of query documents.

## Installation

To install the package, use the following command:

```sh
npm install @ferstack/gql-typescript
```

## Usage

### Editor Remote Control

When dealing with type generators, VSCode can be unresponsive, as it does not update the types when they are generated under a file you are not currently accessing.

For instance, [Prisma](https://www.prisma.io/) type generation works by restarting the TypeScript server each time you run `prisma db push`.

Although I may develop a library-specific extension in the future, for now, I'm using the [VScode remote control extension](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-remote-control) to reload the TS Server.

It works by opening a WebSocket server where you pass commands to be executed in VSCode.

That means: **IF YOU ARE USING VSCODE, YOU MUST INSTALL THIS EXTENSION**

### GraphQL Schema

You will need a GraphQL schema, which can be located at a path or an HTTP URL:

```graphql
# apps/backend/schema.graphql

scalar DateTime

type PhysicalEvaluation {
  height: Float!
  weight: Float!
}

type Mutation {
  createPhysicalEvaluation: PhysicalEvaluation!
}
```

### CLI Configuration

Now, configure the CLI to run with the frontend server to generate the types:

```typescript
// apps/frontend/config.mjs

import { CLIConfig } from "@ferstack/gql-typescript/cli";

const config = new CLIConfig({
  schema: "apps/backend/schema.graphql",
  watch: true,
});

export default config;
```

### Execute the Generator with the Frontend Server

```ts
// apps/frontend/package.json
{
  "name": "web",
  "scripts": {
    "dev": "gql-typescript --config ./config.mjs && next dev"
  }
}
```

### The Actual Client

`gql-typescript` offers just a query-builder, so you'll need a client to execute the query.

Here's an implementation with `SWR` and `graphql-request` for `NextJS`:

```typescript
// apps/frontend/lib/swr-gql.ts
import { GQLRequest } from "@ferstack/gql-typescript";
import { DocumentNode } from "graphql";
import { request } from "graphql-request";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

function fetcher(query: DocumentNode, variables: Record<string, any> = {}) {
  return request("http://localhost:5000/graphql", query, variables);
}

export function useQuery<TRequest extends GQLRequest<any, any>>(
  request: TRequest
) {
  const { mutate, ...rest } = useSWR<TRequest["_returnType"], any, any>(
    request.documentNode,
    (document: DocumentNode, { arg }: { arg: TRequest["_variablesType"] }) =>
      fetcher(document, request.variables(arg)) as any
  );

  return rest;
}

export function useMutation<TRequest extends GQLRequest<any, any>>(
  request: TRequest
) {
  return useSWRMutation<
    TRequest["_returnType"],
    any,
    DocumentNode,
    TRequest["_variablesType"]
  >(
    request.documentNode,
    (document, { arg }) => fetcher(document, request.variables(arg)) as any,
    {
      populateCache: false,
    }
  );
}
```

### Enjoy Full Query Type Safety

```tsx
// apps/frontend/page.tsx

import { useState } from "react";
import { gql } from "@ferstack/gql-typescript";
import { useQuery } from 'lib/swr-gql'

export function AddPhysicalEval() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const mutation = gql("mutation", {
    createPhysicalEvaluation: {
      data: {
        height: true,
        weight: true,
      },
      errors: {
        message: true,
        path: true,
      },
    },
  });

  const { data, trigger } = useMutation(mutation);


  const entry = data[
    // full autocomplete on response
  ]

  trigger({
    // this will also show all args you declared
  })

  return <Fragment />;
}
```

## Warnings

- Keep in mind I'm currently using polling for fetching the URL schema every 1.5 seconds, so it might not be ideal. I'm looking forward to implementing WebSockets and GraphQL subscriptions.
