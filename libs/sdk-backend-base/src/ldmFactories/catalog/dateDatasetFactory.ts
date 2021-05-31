// (C) 2019-2021 GoodData Corporation
import identity from "lodash/identity";
import { DateAttributeGranularity, ObjRef } from "@gooddata/sdk-model";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    IDataSetMetadataObject,
    isAttributeDisplayFormMetadataObject,
    isAttributeMetadataObject,
    isDataSetMetadataObject,
} from "@gooddata/sdk-backend-spi";

import { Builder, builderFactory, BuilderModifications } from "../builder";
import { AttributeMetadataObjectBuilder, newAttributeMetadataObject } from "../metadata/attributeFactory";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../metadata/displayFormFactory";
import { DataSetMetadataObjectBuilder, newDataSetMetadataObject } from "../metadata/dataSetFactory";

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
}

/**
 * Catalog date attribute factory
 *
 * @param modifications - catalog date attribute builder modifications to perform
 * @returns created catalog date attribute
 * @beta
 */
export const newCatalogDateAttribute = (
    modifications: BuilderModifications<CatalogDateAttributeBuilder> = identity,
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
        if (!isDataSetMetadataObject(dataSetOrRef)) {
            this.item.dataSet = newDataSetMetadataObject(dataSetOrRef, modifications);
        } else {
            this.item.dataSet = dataSetOrRef;
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
    modifications: BuilderModifications<CatalogDateDatasetBuilder> = identity,
): ICatalogDateDataset => builderFactory(CatalogDateDatasetBuilder, { type: "dateDataset" }, modifications);
