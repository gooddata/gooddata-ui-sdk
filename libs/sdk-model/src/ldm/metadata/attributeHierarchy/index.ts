// (C) 2023-2025 GoodData Corporation

import { type DateAttributeGranularity } from "../../../base/dateGranularities.js";
import { type ObjRef } from "../../../objRef/index.js";
import { type IMetadataObjectBase, type IMetadataObjectIdentity, isMetadataObject } from "../types.js";

/**
 * Attribute hierarchy metadata object.
 *
 * @public
 */
export interface IAttributeHierarchyMetadataObject extends IMetadataObjectIdentity, IMetadataObjectBase {
    type: "attributeHierarchy";

    /**
     * Ordered array of attributes which represent hierarchy.
     */
    attributes: ObjRef[];
}

/**
 * Tests whether the provided object is of type {@link IAttributeHierarchyMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isAttributeHierarchyMetadataObject(obj: unknown): obj is IAttributeHierarchyMetadataObject {
    return isMetadataObject(obj) && obj.type === "attributeHierarchy";
}

/**
 * Hierarchy template for date dataset
 *
 * @alpha
 */
export interface IDateHierarchyTemplate extends IMetadataObjectIdentity, IMetadataObjectBase {
    type: "dateHierarchyTemplate";
    granularities: DateAttributeGranularity[];
}
