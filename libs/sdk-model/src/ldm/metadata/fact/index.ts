// (C) 2019-2025 GoodData Corporation

import { type IDataSetMetadataObject } from "../dataSet/index.js";
import { type IMetadataObject, isMetadataObject } from "../types.js";

/**
 * Fact metadata object
 *
 * @public
 */
export interface IFactMetadataObject extends IMetadataObject {
    type: "fact";

    /**
     * Whether the fact is locked for editing
     */
    isLocked?: boolean;

    /**
     * DataSet the fact belongs to (if supplied by backend include)
     */
    dataSet?: IDataSetMetadataObject;
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
