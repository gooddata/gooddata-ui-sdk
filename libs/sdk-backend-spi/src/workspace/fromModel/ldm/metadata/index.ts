// (C) 2019-2021 GoodData Corporation
import { IAttributeMetadataObject, isAttributeMetadataObject } from "./attribute";
import {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
} from "./attributeDisplayForm";
import { IDashboardMetadataObject, isDashboardMetadataObject } from "./dashboard";
import { IDataSetMetadataObject, isDataSetMetadataObject } from "./dataSet";
import { IFactMetadataObject, isFactMetadataObject } from "./fact";
import {
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "./measure";
import { IMetadataObject, isMetadataObject } from "./types";
import { isVariableMetadataObject, IVariableMetadataObject } from "./variable";

export {
    IMetadataObject,
    isMetadataObject,
    IAttributeMetadataObject,
    isAttributeMetadataObject,
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
    IFactMetadataObject,
    isFactMetadataObject,
    IMeasureMetadataObject,
    isMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObjectDefinition,
    IDataSetMetadataObject,
    isDataSetMetadataObject,
    IVariableMetadataObject,
    isVariableMetadataObject,
    IDashboardMetadataObject,
    isDashboardMetadataObject,
};

/**
 * Type that represents any metadata object
 *
 * @public
 */
export type MetadataObject =
    | IAttributeMetadataObject
    | IAttributeDisplayFormMetadataObject
    | IFactMetadataObject
    | IMeasureMetadataObject
    | IDataSetMetadataObject
    | IVariableMetadataObject
    | IDashboardMetadataObject;

/**
 * Get metadata object identifier
 *
 * @public
 */
export const metadataObjectId = (metadataObject: MetadataObject): string => metadataObject.id;
