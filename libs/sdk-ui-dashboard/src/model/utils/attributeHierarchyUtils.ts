// (C) 2023-2024 GoodData Corporation

import {
    areObjRefsEqual,
    ICatalogAttributeHierarchy,
    ICatalogDateAttributeHierarchy,
    IDrillDownReference,
    isAttributeHierarchyReference,
    isCatalogAttributeHierarchy,
    isCatalogDateAttributeHierarchy,
    isDateHierarchyReference,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function existBlacklistHierarchyPredicate(
    reference: IDrillDownReference,
    attributeHierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    attributeIdentifier?: ObjRef,
): boolean {
    if (isAttributeHierarchyReference(reference) && isCatalogAttributeHierarchy(attributeHierarchy)) {
        return (
            areObjRefsEqual(reference.attributeHierarchy, attributeHierarchy.attributeHierarchy.ref) &&
            areObjRefsEqual(reference.attribute, attributeIdentifier)
        );
    }
    if (isDateHierarchyReference(reference) && isCatalogDateAttributeHierarchy(attributeHierarchy)) {
        return (
            objRefToString(reference.dateHierarchyTemplate) === attributeHierarchy.templateId &&
            areObjRefsEqual(reference.dateDatasetAttribute, attributeIdentifier)
        );
    }
    return false;
}
