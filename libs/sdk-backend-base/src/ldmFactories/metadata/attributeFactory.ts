// (C) 2019-2025 GoodData Corporation
import identity from "lodash/identity.js";

import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";

import { MetadataObjectBuilder } from "./factory.js";
import { BuilderModifications, builderFactory } from "../builder.js";

/**
 * Attribute metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class AttributeMetadataObjectBuilder<
    T extends IAttributeMetadataObject = IAttributeMetadataObject,
> extends MetadataObjectBuilder<T> {
    public isLocked(value: boolean): this {
        this.item.isLocked = value;
        return this;
    }

    public drillDownStep(ref: ObjRef | undefined): this {
        if (ref) {
            this.item.drillDownStep = ref;
        }
        return this;
    }

    public drillToAttributeLink(ref: ObjRef | undefined): this {
        if (ref) {
            this.item.drillToAttributeLink = ref;
        }
        return this;
    }

    public displayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this {
        this.item.displayForms = displayForms;
        return this;
    }
}

/**
 * Attribute metadata object factory
 *
 * @param ref - attribute reference
 * @param modifications - attribute builder modifications to perform
 * @returns created attribute metadata object
 * @beta
 */
export const newAttributeMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<AttributeMetadataObjectBuilder> = identity,
): IAttributeMetadataObject =>
    builderFactory(AttributeMetadataObjectBuilder, { type: "attribute", ref }, modifications);
