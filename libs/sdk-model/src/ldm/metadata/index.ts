// (C) 2019-2024 GoodData Corporation
import { IAttributeMetadataObject, isAttributeMetadataObject } from "./attribute/index.js";
import {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
    attributeDisplayFormMetadataObjectAttributeRef,
    attributeDisplayFormMetadataObjectRef,
    attributeDisplayFormMetadataObjectTitle,
    AttributeDisplayFormType,
} from "./attributeDisplayForm/index.js";
import {
    IAttributeHierarchyMetadataObject,
    isAttributeHierarchyMetadataObject,
    IDateHierarchyTemplate,
} from "./attributeHierarchy/index.js";
import { IDashboardMetadataObject, isDashboardMetadataObject } from "./dashboard/index.js";
import { IDataSetMetadataObject, isDataSetMetadataObject } from "./dataSet/index.js";
import { IFactMetadataObject, isFactMetadataObject } from "./fact/index.js";
import {
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "./measure/index.js";
import {
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    IMetadataObjectDefinition,
    isMetadataObject,
} from "./types.js";
import { isVariableMetadataObject, IVariableMetadataObject } from "./variable/index.js";

export type {
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    IAttributeMetadataObject,
    IAttributeDisplayFormMetadataObject,
    AttributeDisplayFormType,
    IFactMetadataObject,
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    IMetadataObjectDefinition,
    IMeasureMetadataObjectDefinition,
    IDataSetMetadataObject,
    IVariableMetadataObject,
    IDashboardMetadataObject,
    IAttributeHierarchyMetadataObject,
    IDateHierarchyTemplate,
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
    | IAttributeHierarchyMetadataObject;

/**
 * Get metadata object identifier
 *
 * @public
 */
export const metadataObjectId = (metadataObject: MetadataObject): string => metadataObject.id;
