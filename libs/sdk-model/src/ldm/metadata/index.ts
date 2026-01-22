// (C) 2019-2026 GoodData Corporation

import { type IAttributeMetadataObject } from "./attribute/index.js";
import { type IAttributeDisplayFormMetadataObject } from "./attributeDisplayForm/index.js";
import { type IAttributeHierarchyMetadataObject } from "./attributeHierarchy/index.js";
import { type IDashboardMetadataObject } from "./dashboard/index.js";
import { type IDataSetMetadataObject } from "./dataSet/index.js";
import { type IFactMetadataObject } from "./fact/index.js";
import { type IMeasureMetadataObject } from "./measure/index.js";
import { type IMemoryItemMetadataObject } from "./memoryItem/index.js";
import { type IVariableMetadataObject } from "./variable/index.js";

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
