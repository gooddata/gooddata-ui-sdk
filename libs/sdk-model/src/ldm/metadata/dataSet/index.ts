// (C) 2019-2025 GoodData Corporation

import { type IMetadataObject, isMetadataObject } from "../types.js";

/**
 * DataSet metadata object
 *
 * @public
 */
export interface IDataSetMetadataObject extends IMetadataObject {
    type: "dataSet";

    /**
     * Whether the dataset is locked for editing.
     */
    isLocked?: boolean;

    /**
     * Attributes that belong to this dataset (if supplied by backend include).
     *
     * @beta
     */
    attributes?: IDataSetAttributeMetadataObject[];
}

/**
 * Attribute metadata object that can appear in {@link IDataSetMetadataObject.attributes}.
 *
 * @remarks
 * This intentionally does not use `IAttributeMetadataObject` to avoid a circular dependency in `sdk-model`
 * (`IAttributeMetadataObject` already references {@link IDataSetMetadataObject} via `dataSet`).
 *
 * @beta
 */
export type IDataSetAttributeMetadataObject = IMetadataObject & { type: "attribute" };

/**
 * Tests whether the provided object is of type {@link IDataSetMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isDataSetMetadataObject(obj: unknown): obj is IDataSetMetadataObject {
    return isMetadataObject(obj) && obj.type === "dataSet";
}
