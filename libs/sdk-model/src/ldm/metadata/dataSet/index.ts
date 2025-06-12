// (C) 2019-2020 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types.js";

/**
 * DataSet metadata object
 *
 * @public
 */
export interface IDataSetMetadataObject extends IMetadataObject {
    type: "dataSet";
}

/**
 * Tests whether the provided object is of type {@link IDataSetMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isDataSetMetadataObject(obj: unknown): obj is IDataSetMetadataObject {
    return isMetadataObject(obj) && obj.type === "dataSet";
}
