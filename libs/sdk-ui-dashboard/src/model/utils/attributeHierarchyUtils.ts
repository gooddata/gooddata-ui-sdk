// (C) 2023 GoodData Corporation

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
    attributeIdentifier?: string,
): boolean {
    if (isAttributeHierarchyReference(reference)) {
        return (
            areObjRefsEqual(reference.attributeHierarchy, attributeHierarchyRef) &&
            objRefToString(reference.label) === attributeIdentifier
        );
    }
    return (
        areObjRefsEqual(reference.dateHierarchyTemplate, attributeHierarchyRef) &&
        objRefToString(reference.dateDatasetAttribute) === attributeIdentifier
    );
}
