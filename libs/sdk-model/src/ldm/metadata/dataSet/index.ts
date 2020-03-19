// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * DataSet metadata object
 *
 * @public
 */
export interface IDataSetMetadataObject extends IMetadataObject {
    type: "dataSet";
}
