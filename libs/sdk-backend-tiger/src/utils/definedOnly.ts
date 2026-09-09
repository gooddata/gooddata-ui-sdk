// (C) 2026 GoodData Corporation

/**
 * Returns a copy of the object without the keys whose value is undefined, so optional fields are
 * present on a converted object only when the input actually carried them.
 */
export function definedOnly<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
}
