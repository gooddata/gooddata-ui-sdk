// (C) 2023-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ObjRef } from "../../../objRef/index.js";
import { type IAttributeHierarchyMetadataObject } from "../../metadata/index.js";

/**
 * Type representing catalog attribute hierarchy.
 *
 * @public
 */
export interface ICatalogAttributeHierarchy {
    type: "attributeHierarchy";

    /**
     * Attribute hierarchy metadata object that attribute hierarchy represents.
     */
    attributeHierarchy: IAttributeHierarchyMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttributeHierarchy}.
 *
 * @public
 */
export function isCatalogAttributeHierarchy(obj: unknown): obj is ICatalogAttributeHierarchy {
    return !isEmpty(obj) && (obj as ICatalogAttributeHierarchy).type === "attributeHierarchy";
}

/**
 * @internal
 */
export function isCatalogDateAttributeHierarchy(obj: unknown): obj is ICatalogDateAttributeHierarchy {
    return !isEmpty(obj) && (obj as ICatalogDateAttributeHierarchy).type === "dateAttributeHierarchy";
}

/**
 * @internal
 */
export interface ICatalogDateAttributeHierarchy {
    type: "dateAttributeHierarchy";
    // hierarchy ref
    ref: ObjRef;
    /**
     * Date dataset ref
     */
    dateDatasetRef: ObjRef;
    /**
     * refs to attributes in hierarchy
     */
    attributes: ObjRef[];
    title: string;
    templateId: string;
}

/**
 * @internal
 */
export const getHierarchyRef = (
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
): ObjRef => {
    return isCatalogAttributeHierarchy(hierarchy) ? hierarchy.attributeHierarchy.ref : hierarchy.ref;
};

/**
 * @internal
 */
export const getHierarchyTitle = (
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
): string => {
    return isCatalogAttributeHierarchy(hierarchy) ? hierarchy.attributeHierarchy.title : hierarchy.title;
};

/**
 * @internal
 */
export const getHierarchyAttributes = (
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
): ObjRef[] => {
    return isCatalogAttributeHierarchy(hierarchy)
        ? hierarchy.attributeHierarchy.attributes
        : hierarchy.attributes;
};
