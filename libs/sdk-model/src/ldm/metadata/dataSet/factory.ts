// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IDataSetMetadataObject } from ".";

/**
 * @public
 */
export class DataSetMetadataObjectBuilder<
    T extends IDataSetMetadataObject = IDataSetMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * @public
 */
export const newDataSetMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<DataSetMetadataObjectBuilder> = identity,
): IDataSetMetadataObject => builderFactory(DataSetMetadataObjectBuilder, { ref }, modifications);
