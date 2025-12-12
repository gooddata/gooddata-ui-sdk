// (C) 2019-2025 GoodData Corporation

import {
    type DateAttributeGranularity,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type ICatalogDateAttribute,
    type ICatalogDateDataset,
    type IDataSetMetadataObject,
    type ObjRef,
    isAttributeDisplayFormMetadataObject,
    isAttributeMetadataObject,
    isDataSetMetadataObject,
} from "@gooddata/sdk-model";

import { Builder, type BuilderModifications, builderFactory } from "../builder.js";
import {
    type AttributeMetadataObjectBuilder,
    newAttributeMetadataObject,
} from "../metadata/attributeFactory.js";
import { type DataSetMetadataObjectBuilder, newDataSetMetadataObject } from "../metadata/dataSetFactory.js";
import {
    type AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../metadata/displayFormFactory.js";

/**
 * Catalog date attribute builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogDateAttributeBuilder<
    T extends ICatalogDateAttribute = ICatalogDateAttribute,
> extends Builder<T> {
    public granularity(granularity: DateAttributeGranularity): this {
        this.item.granularity = granularity;
        return this;
    }

    public attribute(
        attributeOrRef: IAttributeMetadataObject | ObjRef,
        modifications?: BuilderModifications<AttributeMetadataObjectBuilder>,
    ): this {
        if (isAttributeMetadataObject(attributeOrRef)) {
            this.item.attribute = attributeOrRef;
        } else {
            this.item.attribute = newAttributeMetadataObject(attributeOrRef, modifications);
        }
        return this;
    }

    public defaultDisplayForm(
        displayFormOrRef: IAttributeDisplayFormMetadataObject | ObjRef,
        modifications?: BuilderModifications<AttributeDisplayFormMetadataObjectBuilder>,
    ): this {
        if (isAttributeDisplayFormMetadataObject(displayFormOrRef)) {
            this.item.defaultDisplayForm = displayFormOrRef;
        } else {
            this.item.defaultDisplayForm = newAttributeDisplayFormMetadataObject(
                displayFormOrRef,
                modifications,
            );
        }
        return this;
    }
}

/**
 * Catalog date attribute factory
 *
 * @param modifications - catalog date attribute builder modifications to perform
 * @returns created catalog date attribute
 * @beta
 */
export const newCatalogDateAttribute = (
    modifications: BuilderModifications<CatalogDateAttributeBuilder> = (v) => v,
): ICatalogDateAttribute => builderFactory(CatalogDateAttributeBuilder, {}, modifications);

/**
 * Catalog date dataset builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogDateDatasetBuilder<
    T extends ICatalogDateDataset = ICatalogDateDataset,
> extends Builder<T> {
    public relevance(relevance: number): this {
        this.item.relevance = relevance;
        return this;
    }

    public dateAttributes(dateAttributes: ICatalogDateAttribute[]): this {
        this.item.dateAttributes = dateAttributes;
        return this;
    }

    public dataSet(
        dataSetOrRef: IDataSetMetadataObject | ObjRef,
        modifications?: BuilderModifications<DataSetMetadataObjectBuilder>,
    ): this {
        if (isDataSetMetadataObject(dataSetOrRef)) {
            this.item.dataSet = dataSetOrRef;
        } else {
            this.item.dataSet = newDataSetMetadataObject(dataSetOrRef, modifications);
        }
        return this;
    }
}

/**
 * Catalog date dataset factory
 *
 * @param modifications - catalog date dataset builder modifications to perform
 * @returns created catalog date dataset
 * @beta
 */
export const newCatalogDateDataset = (
    modifications: BuilderModifications<CatalogDateDatasetBuilder> = (v) => v,
): ICatalogDateDataset => builderFactory(CatalogDateDatasetBuilder, { type: "dateDataset" }, modifications);
