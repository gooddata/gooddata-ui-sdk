// (C) 2026 GoodData Corporation

type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
    ? `${Head extends Lowercase<Head> ? Head : `_${Lowercase<Head>}`}${SnakeCase<Tail>}`
    : S;

type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<CamelCase<Tail>>}`
    : S;

/** @internal */
export type SnakeKeys<T> = T extends readonly (infer Item)[]
    ? SnakeKeys<Item>[]
    : T extends object
      ? { [K in keyof T as K extends string ? SnakeCase<K> : K]: SnakeKeys<T[K]> }
      : T;

/** @internal */
export type CamelKeys<T> = T extends readonly (infer Item)[]
    ? CamelKeys<Item>[]
    : T extends object
      ? { [K in keyof T as K extends string ? CamelCase<K> : K]: CamelKeys<T[K]> }
      : T;

function mapKeys(value: unknown, rename: (key: string) => string): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => mapKeys(item, rename));
    }
    if (value === null || typeof value !== "object") {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [rename(key), mapKeys(item, rename)]),
    );
}

/**
 * Every key of a plain JSON value, at any depth, in snake_case. Values are kept as they are.
 *
 * @internal
 */
export function snakeKeys<T>(value: T): SnakeKeys<T> {
    // Sound only while snakeKey renames exactly as the SnakeCase type does.
    return mapKeys(value, snakeKey) as SnakeKeys<T>;
}

/** @internal */
export function snakeKey(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Every key of a plain JSON value, at any depth, in camelCase. Values are kept as they are.
 *
 * @internal
 */
export function camelKeys<T>(value: T): CamelKeys<T> {
    // Sound only while the regex renames exactly as the CamelCase type does.
    return mapKeys(value, (key) =>
        key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase()),
    ) as CamelKeys<T>;
}
