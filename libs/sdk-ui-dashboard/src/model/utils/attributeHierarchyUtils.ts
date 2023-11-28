// (C) 2023 GoodData Corporation

import {
    areObjRefsEqual,
    IDrillDownReference,
    isAttributeHierarchyReference,
    ObjRef,
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
        areObjRefsEqual(reference.dateHierarchyTemplate, attributeHierarchyRef) &&
        areObjRefsEqual(reference.dateDatasetAttribute, attributeIdentifier)
    );
}
