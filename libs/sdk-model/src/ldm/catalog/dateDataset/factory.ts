// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { Builder, builderFactory, BuilderModifications } from "../../../base/builder";
import { CatalogDateAttributeGranularity, ICatalogDateAttribute, ICatalogDateDataset } from ".";
import { IAttributeMetadataObject, isAttributeMetadataObject } from "../../metadata/attribute";
import {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
} from "../../metadata/attributeDisplayForm";
import { ObjRef } from "../../../objRef";
import { AttributeMetadataObjectBuilder, newAttributeMetadataObject } from "../../metadata/attribute/factory";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "../../metadata/attributeDisplayForm/factory";
import {
    DataSetMetadataObjectBuilder,
    IDataSetMetadataObject,
    newDataSetMetadataObject,
} from "../../metadata";
import { isDataSetMetadataObject } from "../../metadata/dataSet";

/**
 * Catalog date attribute builder
 * See {@link Builder}
 *
 * @public
 */
export class CatalogDateAttributeBuilder<
    T extends ICatalogDateAttribute = ICatalogDateAttribute
> extends Builder<T> {
    public granularity(granularity: CatalogDateAttributeGranularity): this {
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
}

/**
 * Catalog date attribute factory
 *
 * @param modifications - catalog date attribute builder modifications to perform
 * @returns created catalog date attribute
 * @public
 */
export const newCatalogDateAttribute = (
    modifications: BuilderModifications<CatalogDateAttributeBuilder> = identity,
): ICatalogDateAttribute => builderFactory(CatalogDateAttributeBuilder, {}, modifications);

/**
 * Catalog date dataset builder
 * See {@link Builder}
 *
 * @public
 */
export class CatalogDateDatasetBuilder<T extends ICatalogDateDataset = ICatalogDateDataset> extends Builder<
    T
> {
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
 * @public
 */
export const newCatalogDateDataset = (
    modifications: BuilderModifications<CatalogDateDatasetBuilder> = identity,
): ICatalogDateDataset => builderFactory(CatalogDateDatasetBuilder, { type: "dateDataset" }, modifications);
