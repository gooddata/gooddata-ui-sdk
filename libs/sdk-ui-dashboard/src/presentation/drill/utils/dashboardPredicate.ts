// (C) 2021-2026 GoodData Corporation

import { type Identifier, type ObjRef, areObjRefsEqual, idRef } from "@gooddata/sdk-model";

/**
 * Tests whether a dashboard identifier OR dashboard ref match another dashboard's ref.
 */
export function dashboardMatch(identifier: Identifier, ref: ObjRef, otherRef: ObjRef): boolean {
    return areObjRefsEqual(ref, otherRef) || areObjRefsEqual(idRef(identifier), otherRef);
}
