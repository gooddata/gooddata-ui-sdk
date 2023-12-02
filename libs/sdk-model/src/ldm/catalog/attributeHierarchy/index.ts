// (C) 2023 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { IAttributeHierarchyMetadataObject } from "../../metadata/index.js";
import { ObjRef } from "../../../objRef/index.js";

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
    dateDatasetRef: ObjRef;
    title: string;
    templateId: string;
    attributes: ObjRef[];
}
