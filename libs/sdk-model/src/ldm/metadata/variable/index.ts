// (C) 2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * Variable metadata object
 *
 * @public
 */
export interface IVariableMetadataObject extends IMetadataObject {
    type: "variable";
}
