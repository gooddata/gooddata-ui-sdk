// (C) 2022-2025 GoodData Corporation

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

export function createReference(parts: RegExpExecArray): { id: string; ref: IdentifierRef | null } {
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

function normalizeType(type: string): "displayForm" | "measure" | null {
    if (type === "label" || type === "displayForm") {
        return "displayForm";
    }
    if (type === "metric" || type === "measure") {
        return "measure";
    }
    return null;
}
