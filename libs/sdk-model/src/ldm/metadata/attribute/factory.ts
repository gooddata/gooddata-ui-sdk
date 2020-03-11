// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IAttributeMetadataObject } from ".";

/**
 * @public
 */
export class AttributeMetadataObjectBuilder<
    T extends IAttributeMetadataObject = IAttributeMetadataObject
> extends MetadataObjectBuilder<T> {}

/**
 * @public
 */
export const newAttributeMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeMetadataObjectBuilder> = identity,
): IAttributeMetadataObject =>
    builderFactory(AttributeMetadataObjectBuilder, { type: "attribute", ref }, modifications);
