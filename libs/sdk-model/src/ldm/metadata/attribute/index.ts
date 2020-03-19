// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * Attribute metadata object
 *
 * @public
 */
export interface IAttributeMetadataObject extends IMetadataObject {
    type: "attribute";
}
