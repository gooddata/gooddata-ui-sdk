// (C) 2019-2022 GoodData Corporation
import { GdcMetadata } from "@gooddata/api-model-bear";
import { ICatalogDateAttribute, IFactMetadataObject, IMeasureMetadataObject } from "@gooddata/sdk-model";

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
export interface IMeasureByKey {
    [key: string]: IMeasureMetadataObject;
}

/**
 * @internal
 */
export interface IFactByKey {
    [key: string]: IFactMetadataObject;
}

/**
 * @internal
 */
export interface IDateAttributeByKey {
    [key: string]: ICatalogDateAttribute;
}

/**
 * @internal
 */
export interface IUriMappings {
    attributeById: IAttributeByKey;
    attributeByDisplayFormUri: IAttributeByKey;
    displayFormById: IDisplayFormByKey;
    measureById: IMeasureByKey;
    factById: IFactByKey;
    dateAttributeById: IDateAttributeByKey;
}
