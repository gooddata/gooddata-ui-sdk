// (C) 2019 GoodData Corporation
import { GdcMetadata } from "@gooddata/gd-bear-model";
import { ICatalogMeasure } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IAttributeByKey {
    [key: string]: GdcMetadata.IWrappedAttribute;
}

/**
 * @internal
 */
export interface IDisplayFormByKey {
    [key: string]: GdcMetadata.IAttributeDisplayForm;
}

/**
 * @internal
 */
export interface ICatalogMeasureByKey {
    [key: string]: ICatalogMeasure;
}

/**
 * @internal
 */
export interface IUriMappings {
    attributeByDisplayFormUri: IAttributeByKey;
    displayFormById: IDisplayFormByKey;
    catalogMeasureById: ICatalogMeasureByKey;
}
