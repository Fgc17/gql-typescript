export type Defined<T> = T extends undefined | null ? never : T;

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends Scalar
      ? RecursivePartial<T[P]>
      : T[P];
};

export type RecursivePick<T, K extends keyof T> = {
  [P in K]: T[P] extends (infer U)[]
    ? RecursivePick<U, keyof U>[]
    : T[P] extends Scalar
      ? T[P]
      : RecursivePick<T[P], keyof T[P]>;
};

export type StrictPartial<Partial> = RecursivePartial<Partial> &
  RecursivePick<Partial, keyof Partial>;

export type PreserveOptional<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Scalar =
  | boolean
  | number
  | string
  | bigint
  | symbol
  | Date
  | RegExp
  | Uint8Array;

export type CleanKeys<T, K extends keyof T> = T[K] & {} extends Function
  ? never
  : K extends symbol
    ? never
    : K;

export type EntityKey<T = unknown> = string &
  keyof {
    [K in keyof T as CleanKeys<T, K>]?: unknown;
  };

export type SelectQuery<T> = {
  -readonly [K in EntityKey<T>]?: T[K] extends Scalar
    ? boolean
    : SelectQuery<Defined<T[K]>>;
};

export type MapFields<BooleanType, ActualType> =
  ActualType extends Array<infer U>
    ? Array<MapFields<BooleanType, U>>
    : {
        [K in keyof BooleanType]: K extends keyof Defined<ActualType>
          ? BooleanType[K] extends true
            ? Defined<ActualType>[K]
            : BooleanType[K] extends Scalar
              ? Defined<ActualType>[K]
              : MapFields<BooleanType[K], Defined<ActualType>[K]>
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
