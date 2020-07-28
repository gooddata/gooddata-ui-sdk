// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "../../../objRef";
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { MetadataObjectBuilder } from "../factory";
import { IAttributeMetadataObject } from ".";

/**
 * Attribute metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class AttributeMetadataObjectBuilder<
    T extends IAttributeMetadataObject = IAttributeMetadataObject
> extends MetadataObjectBuilder<T> {
    public drillDownStep(ref: ObjRef | undefined): this {
        if (ref) {
            this.item.drillDownStep = ref;
        }
        return this;
    }
}

/**
 * Attribute metadata object factory
 *
 * @param ref - attribute reference
 * @param modifications - attribute builder modifications to perform
 * @returns created attribute metadata object
 * @public
 */
export const newAttributeMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeMetadataObjectBuilder> = identity,
): IAttributeMetadataObject =>
    builderFactory(AttributeMetadataObjectBuilder, { type: "attribute", ref }, modifications);
