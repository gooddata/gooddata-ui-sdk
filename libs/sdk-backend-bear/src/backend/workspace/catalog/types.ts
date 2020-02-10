// (C) 2019-2020 GoodData Corporation
import { GdcMetadata } from "@gooddata/gd-bear-model";
import { IMeasureMetadataObject } from "@gooddata/sdk-model";

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
export interface IUriMappings {
    attributeByDisplayFormUri: IAttributeByKey;

    displayFormById: IDisplayFormByKey;
    measureById: IMeasureByKey;
}
