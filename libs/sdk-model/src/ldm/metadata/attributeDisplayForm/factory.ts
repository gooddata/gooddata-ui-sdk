// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IAttributeDisplayFormMetadataObject } from ".";

/**
 * Attribute display form metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class AttributeDisplayFormMetadataObjectBuilder<
    T extends IAttributeDisplayFormMetadataObject = IAttributeDisplayFormMetadataObject
> extends MetadataObjectBuilder<T> {
    public attribute(ref: ObjRef): this {
        this.item.attribute = ref;
        return this;
    }
}

/**
 * Attribute display form metadata object factory
 *
 * @param ref - attribute display form reference
 * @param modifications - attribute diplay form builder modifications to perform
 * @returns created attribute display form metadata object
 * @public
 */
export const newAttributeDisplayFormMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder> = identity,
): IAttributeDisplayFormMetadataObject =>
    builderFactory(AttributeDisplayFormMetadataObjectBuilder, { type: "displayForm", ref }, modifications);
