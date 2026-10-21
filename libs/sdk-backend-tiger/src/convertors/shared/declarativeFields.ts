// (C) 2026 GoodData Corporation

/**
 * Fails to compile when a converter does not destructure every field of its input.
 * Pass the rest of the destructured input object.
 */
export function assertAllFieldsMapped(_unmapped: Record<string, never>): void {}

/**
 * Returns the object without the keys whose value is undefined. A key with a null value stays.
 */
export function withoutUndefined<T extends object>(obj: NoInfer<T>): T {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

export function copyArray<T>(array: T[]): T[];
export function copyArray<T>(array: T[] | undefined): T[] | undefined;
export function copyArray<T>(array: T[] | null | undefined): T[] | null | undefined;
export function copyArray<T>(array: T[] | null | undefined): T[] | null | undefined {
    return array ? [...array] : array;
}

export function mapArray<T, R>(array: T[], fn: (item: T) => R): R[];
export function mapArray<T, R>(array: T[] | undefined, fn: (item: T) => R): R[] | undefined;
export function mapArray<T, R>(array: T[] | undefined, fn: (item: T) => R): R[] | undefined {
    return array?.map((item) => fn(item));
}

export function mapRecord<T, R>(
    record: { [key: string]: T } | undefined,
    fn: (item: T) => R,
): { [key: string]: R } | undefined {
    return record
        ? Object.fromEntries(Object.entries(record).map(([key, value]) => [key, fn(value)]))
        : undefined;
}
