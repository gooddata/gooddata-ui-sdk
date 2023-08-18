// (C) 2023 GoodData Corporation

import { ObjRef } from "../../../objRef/index.js";
import { IMetadataObjectBase, IMetadataObjectIdentity, isMetadataObject } from "../types.js";

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
