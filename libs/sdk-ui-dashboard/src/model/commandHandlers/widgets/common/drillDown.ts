// (C) 2024-2025 GoodData Corporation
import {
    ICatalogAttributeHierarchy,
    ICatalogDateAttributeHierarchy,
    IDrillDownReference,
    ObjRef,
    idRef,
    isCatalogDateAttributeHierarchy,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export const hierarchyToDrillDownReference = (
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    attribute: ObjRef,
): IDrillDownReference => {
    if (isCatalogDateAttributeHierarchy(hierarchy)) {
        return {
            type: "dateHierarchyReference",
            dateHierarchyTemplate: idRef(hierarchy.templateId, "dateHierarchyTemplate"),
            dateDatasetAttribute: attribute,
        };
    } else {
        return {
            type: "attributeHierarchyReference",
            attributeHierarchy: hierarchy.attributeHierarchy.ref,
            attribute: attribute,
        };
    }
};
