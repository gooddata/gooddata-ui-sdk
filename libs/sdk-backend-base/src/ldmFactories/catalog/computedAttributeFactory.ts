// (C) 2026 GoodData Corporation

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogComputedAttribute,
    type IComputedAttributeMetadataObject,
} from "@gooddata/sdk-model";

import { type BuilderModifications, builderFactory } from "../builder.js";

import { GroupableCatalogItemBuilder } from "./groupFactory.js";

/**
 * Catalog computed attribute builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogComputedAttributeBuilder<
    T extends ICatalogComputedAttribute = ICatalogComputedAttribute,
> extends GroupableCatalogItemBuilder<T> {
    public computedAttribute(computedAttribute: IComputedAttributeMetadataObject): this {
        this.item.computedAttribute = computedAttribute;
        return this;
    }

    public defaultDisplayForm(displayForm: IAttributeDisplayFormMetadataObject): this {
        this.item.defaultDisplayForm = displayForm;
        return this;
    }

    public displayForms(displayForms: IAttributeDisplayFormMetadataObject[]): this {
        this.item.displayForms = displayForms;
        return this;
    }
}

/**
 * Catalog computed attribute factory
 *
 * @param modifications - catalog computed attribute builder modifications to perform
 * @returns created catalog computed attribute
 * @beta
 */
export const newCatalogComputedAttribute = (
    modifications: BuilderModifications<CatalogComputedAttributeBuilder>,
): ICatalogComputedAttribute =>
    builderFactory(CatalogComputedAttributeBuilder, { type: "computedAttribute" }, modifications);
