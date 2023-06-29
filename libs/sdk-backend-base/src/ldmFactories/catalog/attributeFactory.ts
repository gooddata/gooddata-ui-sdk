// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import {
    AttributeModifications,
    IAttribute,
    newAttribute,
    ObjRef,
    ICatalogAttribute,
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    isAttributeMetadataObject,
} from "@gooddata/sdk-model";
import { GroupableCatalogItemBuilder } from "./groupFactory.js";
import { builderFactory, BuilderModifications } from "../builder.js";
import { AttributeMetadataObjectBuilder, newAttributeMetadataObject } from "../metadata/attributeFactory.js";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../metadata/displayFormFactory.js";

/**
 * Catalog attribute builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogAttributeBuilder<
    T extends ICatalogAttribute = ICatalogAttribute,
> extends GroupableCatalogItemBuilder<T> {
    public attribute(
        attributeOrRef: IAttributeMetadataObject | ObjRef,
        modifications?: BuilderModifications<AttributeMetadataObjectBuilder>,
    ): this {
        if (!isAttributeMetadataObject(attributeOrRef)) {
            this.item.attribute = newAttributeMetadataObject(attributeOrRef, modifications);
        } else {
            this.item.attribute = attributeOrRef;
        }
        return this;
    }

    public defaultDisplayForm(
        displayFormOrRef: IAttributeDisplayFormMetadataObject | ObjRef,
        modifications?: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder>,
    ): this {
        if (!isAttributeDisplayFormMetadataObject(displayFormOrRef)) {
            this.item.defaultDisplayForm = newAttributeDisplayFormMetadataObject(
                displayFormOrRef,
                modifications,
            );
        } else {
            this.item.defaultDisplayForm = displayFormOrRef;
        }
        return this;
    }

    public displayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this {
        this.item.displayForms = displayForms;
        return this;
    }

    public geoPinDisplayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this {
        this.item.geoPinDisplayForms = displayForms;

        return this;
    }

    public toExecutionModel(modifications: AttributeModifications = identity): IAttribute {
        if (!this.item.defaultDisplayForm) {
            throw new Error("Cannot convert catalog attribute to execution model, no displayForm found!");
        }

        const defaultModifications: AttributeModifications = (a) =>
            a.alias(this.item.defaultDisplayForm?.title);

        return newAttribute(this.item.defaultDisplayForm.ref, (m) => modifications(defaultModifications(m)));
    }
}

/**
 * Catalog attribute factory
 *
 * @param modifications - catalog attribute builder modifications to perform
 * @returns created catalog attribute
 * @beta
 */
export const newCatalogAttribute = (
    modifications: BuilderModifications<CatalogAttributeBuilder> = identity,
): ICatalogAttribute => builderFactory(CatalogAttributeBuilder, { type: "attribute" }, modifications);
