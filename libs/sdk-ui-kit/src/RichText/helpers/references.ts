// (C) 2022-2026 GoodData Corporation

import { type IdentifierRef, type ObjRef, type ObjectType, areObjRefsEqual } from "@gooddata/sdk-model";

import { REFERENCE_REGEX_MATCH } from "../plugins/types.js";

export type ReferenceMap = Record<
    string,
    {
        ref: ObjRef;
        type: ObjectType;
    }
>;

export function collectReferences(content: string) {
    const map: ReferenceMap = {};

    const regex = new RegExp(REFERENCE_REGEX_MATCH.source, REFERENCE_REGEX_MATCH.flags);
    let parts = regex.exec(content);

    while (parts) {
        const { id, ref } = createReference(parts);
        if (ref?.type) {
            map[id] = {
                ref,
                type: ref.type,
            };
        }
        parts = regex.exec(content);
    }

    return map;
}

/**
 * The references without those pointing at the given objects. The caller resolves the remaining ones
 * in a single execution, which fails as a whole if it asks for an object the user may not read.
 */
export function excludeReferences(references: ReferenceMap, excluded: ObjRef[]): ReferenceMap {
    if (excluded.length === 0) {
        return references;
    }
    return Object.fromEntries(
        Object.entries(references).filter(
            ([, reference]) => !excluded.some((ref) => areObjRefsEqual(ref, reference.ref)),
        ),
    );
}

export function createReference(parts: RegExpExecArray): {
    id: string;
    ref: IdentifierRef | null;
} {
    const id = parts[2];
    const type = normalizeType(parts[3]);

    if (type) {
        const identifier = parts[4];
        return {
            id,
            ref: {
                type,
                identifier,
            },
        };
    }
    return {
        id,
        ref: null,
    };
}

/**
 * The object type a reference prefix names. A computed attribute keeps its own type rather than
 * collapsing to `displayForm`: it has no labels on the backend, and the `computedAttribute` type on
 * the ref is what tells the execution - and everything else handling an attribute-shaped ref - that
 * this is one. See {@link @gooddata/sdk-model#isComputedAttributeRef}.
 *
 * Compared case-insensitively, the way the reference regex matches the prefix - otherwise a
 * prefix the regex accepts could still resolve to nothing and be left as literal text.
 */
function normalizeType(type: string): "displayForm" | "measure" | "computedAttribute" | null {
    switch (type.toLowerCase()) {
        case "label":
        case "displayform":
            return "displayForm";
        case "metric":
        case "measure":
            return "measure";
        case "computed_attribute":
            return "computedAttribute";
        default:
            return null;
    }
}
