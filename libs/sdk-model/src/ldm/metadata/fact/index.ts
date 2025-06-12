// (C) 2019-2020 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types.js";

/**
 * Fact metadata object
 *
 * @public
 */
export interface IFactMetadataObject extends IMetadataObject {
    type: "fact";
}

/**
 * Tests whether the provided object is of type {@link IFactMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isFactMetadataObject(obj: unknown): obj is IFactMetadataObject {
    return isMetadataObject(obj) && obj.type === "fact";
}
