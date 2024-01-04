// (C) 2023 GoodData Corporation

import isEqual from "lodash/isEqual.js";
import {
    areObjRefsEqual,
    IDrillDownReference,
    isAttributeHierarchyReference,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function existBlacklistHierarchyPredicate(
    reference: IDrillDownReference,
    attributeHierarchyRef: ObjRef,
    attributeIdentifier?: ObjRef,
): boolean {
    if (isAttributeHierarchyReference(reference)) {
        return (
            areObjRefsEqual(reference.attributeHierarchy, attributeHierarchyRef) &&
            areObjRefsEqual(reference.attribute, attributeIdentifier)
        );
    }
    return (
        isEqual(objRefToString(reference.dateHierarchyTemplate), objRefToString(attributeHierarchyRef)) &&
        areObjRefsEqual(reference.dateDatasetAttribute, attributeIdentifier)
    );
}
