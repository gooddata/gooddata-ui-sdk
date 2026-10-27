// (C) 2026 GoodData Corporation

import { type IObjIdentifierQualifier } from "@gooddata/sdk-embedding";
import { type ObjRef, isIdentifierRef } from "@gooddata/sdk-model";

/**
 * Converts a model ref to the identifier qualifier of the embedding API.
 *
 * The ref type is kept: it is the only thing telling a computed attribute reference from a label
 * reference (a computed attribute has no labels and is referenced directly), so dropping it would make
 * a filter on a computed attribute indistinguishable from a filter on a label of the same identifier.
 */
export function toObjIdentifierQualifier(ref: ObjRef): IObjIdentifierQualifier {
    if (isIdentifierRef(ref)) {
        return {
            identifier: ref.identifier,
            ...(ref.type ? { type: ref.type } : {}),
        };
    }
    throw new Error("Expected identifier ref");
}
