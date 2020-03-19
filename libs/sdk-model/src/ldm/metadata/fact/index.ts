// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * Fact metadata object
 *
 * @public
 */
export interface IFactMetadataObject extends IMetadataObject {
    type: "fact";
}
