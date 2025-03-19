// (C) 2022-2025 GoodData Corporation
import { IdentifierRef, ObjectType, ObjRef } from "@gooddata/sdk-model";

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

    REFERENCE_REGEX_MATCH.lastIndex = -1;
    let parts = REFERENCE_REGEX_MATCH.exec(content);

    while (parts) {
        const { id, ref } = createReference(parts);
        if (ref) {
            map[id] = {
                ref,
                type: ref.type,
            };
        }
        parts = REFERENCE_REGEX_MATCH.exec(content);
    }

    return map;
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

function normalizeType(type: string): "displayForm" | "measure" {
    if (type === "label" || type === "displayForm") {
        return "displayForm";
    }
    if (type === "metric" || type === "measure") {
        return "measure";
    }
    return null;
}
