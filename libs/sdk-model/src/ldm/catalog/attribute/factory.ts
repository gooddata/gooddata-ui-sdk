// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { builderFactory, BuilderModifications } from "../../../base/builder";
import { ICatalogAttribute } from ".";
import { IAttributeMetadataObject, isAttributeMetadataObject } from "../../metadata/attribute";
import {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
} from "../../metadata/attributeDisplayForm";
import { GroupableCatalogItemBuilder } from "../group/factory";
import { AttributeMetadataObjectBuilder, newAttributeMetadataObject } from "../../metadata/attribute/factory";
import { ObjRef } from "../../../objRef";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../../metadata";
import { AttributeModifications, newAttribute } from "../../../execution/attribute/factory";
import { IAttribute } from "../../../execution/attribute";

/**
 * Catalog attribute builder
 * See {@link Builder}
 *
 * @public
 */
export class CatalogAttributeBuilder<
    T extends ICatalogAttribute = ICatalogAttribute
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
 * @public
 */
export const newCatalogAttribute = (
    modifications: BuilderModifications<CatalogAttributeBuilder> = identity,
): ICatalogAttribute => builderFactory(CatalogAttributeBuilder, { type: "attribute" }, modifications);
