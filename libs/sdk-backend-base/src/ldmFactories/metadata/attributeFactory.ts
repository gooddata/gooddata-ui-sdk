// (C) 2019-2021 GoodData Corporation
import identity from "lodash/identity";
import { MetadataObjectBuilder } from "./factory";
import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import { builderFactory, BuilderModifications } from "../builder";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Attribute metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class AttributeMetadataObjectBuilder<
    T extends IAttributeMetadataObject = IAttributeMetadataObject,
> extends MetadataObjectBuilder<T> {
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
