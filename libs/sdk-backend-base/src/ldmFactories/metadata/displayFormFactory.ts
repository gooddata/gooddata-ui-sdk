// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { ObjRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { MetadataObjectBuilder } from "./factory.js";
import { builderFactory, BuilderModifications } from "../builder.js";

/**
 * Attribute display form metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class AttributeDisplayFormMetadataObjectBuilder<
    T extends IAttributeDisplayFormMetadataObject = IAttributeDisplayFormMetadataObject,
> extends MetadataObjectBuilder<T> {
    public attribute(ref: ObjRef): this {
        this.item.attribute = ref;
        return this;
    }

    public displayFormType(type: string | undefined): this {
        this.item.displayFormType = type;
        return this;
    }

    public isDefault(value: boolean | undefined): this {
        this.item.isDefault = value;
        return this;
    }
}

/**
 * Attribute display form metadata object factory
 *
 * @param ref - attribute display form reference
 * @param modifications - attribute diplay form builder modifications to perform
 * @returns created attribute display form metadata object
 * @beta
 */
export const newAttributeDisplayFormMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder> = identity,
): IAttributeDisplayFormMetadataObject =>
    builderFactory(AttributeDisplayFormMetadataObjectBuilder, { type: "displayForm", ref }, modifications);
