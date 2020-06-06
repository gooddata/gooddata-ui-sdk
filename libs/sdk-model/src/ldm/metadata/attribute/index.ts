// (C) 2019-2020 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types";

/**
 * Attribute metadata object
 *
 * @public
 */
export interface IAttributeMetadataObject extends IMetadataObject {
    type: "attribute";
}

/**
 * Tests whether the provided object is of type {@link IAttributeMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isAttributeMetadataObject(obj: any): obj is IAttributeMetadataObject {
    return isMetadataObject(obj) && obj.type === "attribute";
}
