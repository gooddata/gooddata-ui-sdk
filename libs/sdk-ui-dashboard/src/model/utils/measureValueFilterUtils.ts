// (C) 2026 GoodData Corporation

import {
    type ICatalogMeasure,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../_staging/metadata/objRefMap.js";

/**
 * Matches a dashboard MVF measure reference against the identifier used in drill URL placeholders.
 *
 * @internal
 */
export function dashboardMeasureValueFilterMatchesIdentifier(
    measureRef: ObjRef,
    identifier: string,
    catalogMeasures: ObjRefMap<ICatalogMeasure>,
) {
    const catalogMeasure = catalogMeasures.get(measureRef);
    return (
        catalogMeasure?.measure.id === identifier ||
        objRefToString(measureRef) === identifier ||
        areObjRefsEqual(measureRef, idRef(identifier, "measure"))
    );
}

/**
 * Matches an insight MVF measure reference against the identifier used in drill URL placeholders.
 *
 * @internal
 */
export function insightMeasureValueFilterMatchesIdentifier(measureRef: ObjRefInScope, identifier: string) {
    return (
        objRefToString(measureRef) === identifier || areObjRefsEqual(measureRef, idRef(identifier, "measure"))
    );
}
