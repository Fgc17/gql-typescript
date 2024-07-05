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

export type SelectQuery<T> = {
  readonly [K in keyof T]?: Defined<T[K]> extends Scalar
    ? boolean
    : Defined<T[K]> extends Array<infer U>
      ? SelectQuery<U>
      : SelectQuery<T[K]>;
};

export type IsEmptyObject<T> = keyof T extends never ? true : false;

export type RemoveEmptyObjects<T> = T extends any
  ? IsEmptyObject<T> extends true
    ? never
    : T
  : never;

export type MapFields<BooleanType, ActualType> = RemoveEmptyObjects<
  ActualType extends Array<infer U>
    ? Array<MapFields<BooleanType, U>>
    : {
        [K in keyof BooleanType &
          keyof ActualType]: BooleanType[K] extends Scalar
          ? ActualType[K]
          : MapFields<BooleanType[K], ActualType[K]>;
      }
>;

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type UnionToObject<U> = UnionToIntersection<
  U extends any ? { [K in keyof U]: Defined<U[K]> } : never
>;
