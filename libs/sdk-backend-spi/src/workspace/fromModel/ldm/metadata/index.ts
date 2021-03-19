// (C) 2019-2021 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "./types";

import { IAttributeMetadataObject, isAttributeMetadataObject } from "./attribute";
import {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
} from "./attributeDisplayForm";
import { IFactMetadataObject, isFactMetadataObject } from "./fact";
import { IMeasureMetadataObject, isMeasureMetadataObject } from "./measure";
import { IDataSetMetadataObject, isDataSetMetadataObject } from "./dataSet";
import { IVariableMetadataObject, isVariableMetadataObject } from "./variable";
import { IDashboardMetadataObject, isDashboardMetadataObject } from "./dashboard";

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
