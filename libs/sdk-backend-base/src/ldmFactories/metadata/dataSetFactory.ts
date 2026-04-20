// (C) 2019-2026 GoodData Corporation

import { type IDataSetMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import { type BuilderModifications, builderFactory } from "../builder.js";
import { MetadataObjectBuilder } from "./factory.js";

/**
 * DataSet metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class DataSetMetadataObjectBuilder<
    T extends IDataSetMetadataObject = IDataSetMetadataObject,
> extends MetadataObjectBuilder<T> {}

/**
 * DataSet metadata object factory
 *
 * @param ref - dataset reference
 * @param modifications - dataset builder modifications to perform
 * @returns created dataset metadata object
 * @beta
 */
export const newDataSetMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<DataSetMetadataObjectBuilder> = (v) => v,
): IDataSetMetadataObject =>
    builderFactory(DataSetMetadataObjectBuilder, { type: "dataSet", ref }, modifications);
