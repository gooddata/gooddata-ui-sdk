// (C) 2020-2026 GoodData Corporation

import { cloneDeepWith } from "lodash-es";

import { isAfmObjectIdentifier } from "@gooddata/api-client-tiger";

import { toObjRef } from "./ObjRefConverter.js";

/**
 * Deep clones an object while sanitizing identifier references.
 *
 * @remarks
 * This is the base implementation used for backward compatibility with existing code
 * that passes this function as a callback (e.g., .map(cloneWithSanitizedIds)).
 *
 * For type-documented conversions between Tiger and sdk-model types, use the
 * cloneWithSanitizedIdsTyped function with explicit type parameters.
 *
 * @param item - Item to clone
 * @returns Cloned item with sanitized IDs
 */
export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isAfmObjectIdentifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });

/**
 * Type-documented version of cloneWithSanitizedIds for conversions between Tiger and sdk-model types.
 *
 * @remarks
 * This function uses explicit type parameters to document the conversion between Tiger types
 * and sdk-model types. The explicit type parameters serve as:
 *
 * 1. Documentation of the type transformation boundary
 * 2. A signal to developers that these are distinct type layers
 * 3. A marker for future refactoring when types diverge
 *
 * When Tiger types and sdk-model types diverge significantly, developers should replace
 * calls to this function with proper field-by-field conversion logic.
 *
 * Example usage:
 * ```typescript
 * cloneWithSanitizedIdsTyped<ITigerBucket[], IBucket[]>(tigerBuckets)
 * ```
 *
 * @param item - Item to clone
 * @returns Cloned item with sanitized IDs, cast to TOutput type
 */
export function cloneWithSanitizedIdsTyped<TInput, TOutput>(item: TInput): TOutput {
    return cloneWithSanitizedIds(item) as TOutput;
}
