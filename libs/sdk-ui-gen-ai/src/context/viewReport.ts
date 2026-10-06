// (C) 2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual, isIdentifierRef } from "@gooddata/sdk-model";

const UNSAVED_VIEW_OBJECT_ID = "unsaved";

/**
 * The id of the object the user is viewing. An object that is not saved yet has no reference, and
 * only one object can be viewed at a time, so one fixed id names it.
 */
export function viewObjectId(ref: ObjRef | undefined): string {
    if (!ref) {
        return UNSAVED_VIEW_OBJECT_ID;
    }
    return isIdentifierRef(ref) ? ref.identifier : ref.uri;
}

/**
 * Whether both are the report the user is viewing. Two reports that are not saved yet count as the
 * same one, but an absent report is never the same as one that is not saved yet.
 */
export function isSameViewReport(a: { ref?: ObjRef } | undefined, b: { ref?: ObjRef } | undefined): boolean {
    return a !== undefined && b !== undefined && areObjRefsEqual(a.ref, b.ref);
}
