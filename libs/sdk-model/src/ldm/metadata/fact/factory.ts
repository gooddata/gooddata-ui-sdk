// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IFactMetadataObject } from ".";

/**
 * @public
 */
export class FactMetadataObjectBuilder<
    T extends IFactMetadataObject = IFactMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * @public
 */
export const newFactMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<FactMetadataObjectBuilder> = identity,
): IFactMetadataObject => builderFactory(FactMetadataObjectBuilder, { type: "fact", ref }, modifications);
