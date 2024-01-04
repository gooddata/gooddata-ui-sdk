// (C) 2023 GoodData Corporation

import { ObjRef } from "../../../objRef/index.js";
import { IMetadataObjectBase, IMetadataObjectIdentity, isMetadataObject } from "../types.js";
import { DateAttributeGranularity } from "../../../base/dateGranularities.js";

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
