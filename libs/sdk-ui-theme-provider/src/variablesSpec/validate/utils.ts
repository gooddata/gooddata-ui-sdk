// (C) 2024 GoodData Corporation
import { groupBy } from "lodash-es";

/**
 * Group collection by unique key.
 * Throws error if duplicate keys are detected.
 */
export function groupByUnique<T, K extends string>(
    collection: T[],
    getUniqueKey: (item: T) => K,
): Record<K, T> {
    const grouped = groupBy(collection, getUniqueKey);
    const result: Record<K, T> = {} as Record<K, T>;

    for (const [key, values] of Object.entries(grouped)) {
        if (!values || values.length === 0 || !values[0]) {
            throw new Error(`No values found for key: "${key}"`);
        } else if (values.length > 1) {
            throw new Error(`Duplicate keys detected for key: "${key}"`);
        }
        result[key as K] = values[0]; // Extract the single value
    }

    return result;
}
