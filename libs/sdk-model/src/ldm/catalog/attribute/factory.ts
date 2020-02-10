// (C) 2019-2020 GoodData Corporation
import identity = require("lodash/identity");
import { BuilderModifications, builderFactory } from "../../../base/builder";
import { ICatalogAttribute } from ".";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { GroupableCatalogItemBuilder } from "../group/factory";
import { newAttributeMetadataObject, AttributeMetadataObjectBuilder } from "../../metadata/attribute/factory";
import { ObjRef, isObjRef } from "../../../objRef";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../../metadata";
import { AttributeModifications, newAttribute } from "../../../execution/attribute/factory";
import { IAttribute } from "../../../execution/attribute";

/**
 * @public
 */
export class CatalogAttributeBuilder<
    T extends ICatalogAttribute = ICatalogAttribute
> extends GroupableCatalogItemBuilder<T> {
    public attribute(
        attributeOrRef: IAttributeMetadataObject | ObjRef,
        modifications?: BuilderModifications<AttributeMetadataObjectBuilder>,
    ): this {
        if (isObjRef(attributeOrRef)) {
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
        if (isObjRef(displayFormOrRef)) {
            this.item.defaultDisplayForm = newAttributeDisplayFormMetadataObject(
                displayFormOrRef,
                modifications,
            );
        } else {
            this.item.defaultDisplayForm = displayFormOrRef;
        }
        return this;
    }

    public toExecutionModel(modifications: AttributeModifications = identity): IAttribute {
        if (!this.item.defaultDisplayForm) {
            throw new Error("Cannot convert catalog attribute to execution model, no displayForm found!");
        }

        const defaultModifications: AttributeModifications = a =>
            a.alias(this.item.defaultDisplayForm?.title!);

        return newAttribute(this.item.defaultDisplayForm.ref, m => modifications(defaultModifications(m)));
    }
}

/**
 * @public
 */
export const newCatalogAttribute = (
    modifications: BuilderModifications<CatalogAttributeBuilder> = identity,
): ICatalogAttribute => builderFactory(CatalogAttributeBuilder, { type: "attribute" }, modifications);

/**
 * @public
 */
export const catalogAttributeToExecutionAttribute = (
    catalogAttribute: ICatalogAttribute,
    modifications: BuilderModifications<CatalogAttributeBuilder> = identity,
): IAttribute => new CatalogAttributeBuilder(catalogAttribute).modify(modifications).toExecutionModel();
