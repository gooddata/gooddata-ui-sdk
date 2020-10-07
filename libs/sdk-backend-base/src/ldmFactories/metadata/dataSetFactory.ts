// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "@gooddata/sdk-model";
import { MetadataObjectBuilder } from "./factory";
import { IDataSetMetadataObject } from "@gooddata/sdk-backend-spi";
import { builderFactory, BuilderModifications } from "../builder";

/**
 * DataSet metadata object builder
 * See {@link Builder}
 *
 * @beta
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
 * @beta
 */
export const newDataSetMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<DataSetMetadataObjectBuilder> = identity,
): IDataSetMetadataObject =>
    builderFactory(DataSetMetadataObjectBuilder, { type: "dataSet", ref }, modifications);
