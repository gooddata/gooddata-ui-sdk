// (C) 2019-2025 GoodData Corporation

import { type IAttributeMetadataObject, isAttributeMetadataObject } from "./attribute/index.js";
import {
    type AttributeDisplayFormType,
    type IAttributeDisplayFormGeoAreaConfig,
    type IAttributeDisplayFormMetadataObject,
    attributeDisplayFormMetadataObjectAttributeRef,
    attributeDisplayFormMetadataObjectRef,
    attributeDisplayFormMetadataObjectTitle,
    isAttributeDisplayFormMetadataObject,
} from "./attributeDisplayForm/index.js";
import {
    type IAttributeHierarchyMetadataObject,
    type IDateHierarchyTemplate,
    isAttributeHierarchyMetadataObject,
} from "./attributeHierarchy/index.js";
import { type IDashboardMetadataObject, isDashboardMetadataObject } from "./dashboard/index.js";
import { type IDataSetMetadataObject, isDataSetMetadataObject } from "./dataSet/index.js";
import { type IFactMetadataObject, isFactMetadataObject } from "./fact/index.js";
import {
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectBase,
    type IMeasureMetadataObjectDefinition,
    type MetricType,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "./measure/index.js";
import {
    type IMemoryItemDefinition,
    type IMemoryItemMetadataObject,
    isMemoryItemMetadataObject,
} from "./memoryItem/index.js";
import {
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectDefinition,
    type IMetadataObjectIdentity,
    isMetadataObject,
} from "./types.js";
import { type IVariableMetadataObject, isVariableMetadataObject } from "./variable/index.js";

export type {
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    IAttributeMetadataObject,
    IAttributeDisplayFormMetadataObject,
    IAttributeDisplayFormGeoAreaConfig,
    AttributeDisplayFormType,
    IFactMetadataObject,
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    IMetadataObjectDefinition,
    IMeasureMetadataObjectDefinition,
    MetricType,
    IDataSetMetadataObject,
    IVariableMetadataObject,
    IDashboardMetadataObject,
    IAttributeHierarchyMetadataObject,
    IDateHierarchyTemplate,
    IMemoryItemDefinition,
    IMemoryItemMetadataObject,
};
export {
    isMetadataObject,
    isAttributeMetadataObject,
    isAttributeDisplayFormMetadataObject,
    isFactMetadataObject,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
    isDataSetMetadataObject,
    isVariableMetadataObject,
    isDashboardMetadataObject,
    attributeDisplayFormMetadataObjectAttributeRef,
    attributeDisplayFormMetadataObjectRef,
    attributeDisplayFormMetadataObjectTitle,
    isAttributeHierarchyMetadataObject,
    isMemoryItemMetadataObject,
};
export type {
    IMdObjectBase,
    IMdObjectIdentity,
    IMdObject,
    IMdObjectDefinition,
    ToMdObjectDefinition,
} from "./next.js";
export { isMdObject, isMdObjectDefinition } from "./next.js";

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
    | IDashboardMetadataObject
    | IAttributeHierarchyMetadataObject
    | IMemoryItemMetadataObject;

/**
 * Get metadata object identifier
 *
 * @public
 */
export const metadataObjectId = (metadataObject: MetadataObject): string => metadataObject.id;
