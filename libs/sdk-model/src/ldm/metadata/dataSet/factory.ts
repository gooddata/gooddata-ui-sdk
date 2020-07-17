// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IDataSetMetadataObject } from ".";

/**
 * DataSet metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class DataSetMetadataObjectBuilder<
    T extends IDataSetMetadataObject = IDataSetMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * DataSet metadata object factory
 *
 * @param ref - dataset reference
 * @param modifications - dataset builder modifications to perform
 * @returns created dataset metadata object
 * @public
 */
export const newDataSetMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<DataSetMetadataObjectBuilder> = identity,
): IDataSetMetadataObject =>
    builderFactory(DataSetMetadataObjectBuilder, { type: "dataSet", ref }, modifications);
