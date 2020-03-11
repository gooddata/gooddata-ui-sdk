// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IAttributeDisplayFormMetadataObject } from ".";

/**
 * @public
 */
export class AttributeDisplayFormMetadataObjectBuilder<
    T extends IAttributeDisplayFormMetadataObject = IAttributeDisplayFormMetadataObject
> extends MetadataObjectBuilder<T> {
    public attribute(ref: ObjRef) {
        this.item.attribute = ref;
        return this;
    }
}

/**
 * @public
 */
export const newAttributeDisplayFormMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder> = identity,
): IAttributeDisplayFormMetadataObject =>
    builderFactory(AttributeDisplayFormMetadataObjectBuilder, { type: "displayForm", ref }, modifications);
