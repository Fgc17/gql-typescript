export type IsScalar<T> = T extends
  | string
  | number
  | Array<any>
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Function
  ? true
  : false;

export type RecursiveBoolean<T> = {
  [K in keyof T]?: IsScalar<T[K]> extends true
    ? boolean
    : RecursiveBoolean<T[K]>;
};

export type Defined<T> = T extends undefined | null ? never : T;

export type MapFields<BooleanType, ActualType> = ActualType extends Array<
  infer U
>
  ? Array<MapFields<BooleanType, U>>
  : {
      [K in keyof BooleanType]: K extends keyof Defined<ActualType>
        ? BooleanType[K] extends true
          ? Defined<ActualType>[K]
          : BooleanType[K] extends object
          ? MapFields<BooleanType[K], Defined<ActualType>[K]>
          : never
        : never;
    };

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type UnionToObject<U> = UnionToIntersection<
  U extends any ? { [K in keyof U]: Defined<U[K]> } : never
>;
