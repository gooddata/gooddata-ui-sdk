// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

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
    IMeasureMetadataObjectBase,
    IMetadataObjectDefinition,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
} from "./measure";
import { IMetadataObject, IMetadataObjectBase, IMetadataObjectIdentity, isMetadataObject } from "./types";
import { isVariableMetadataObject, IVariableMetadataObject } from "./variable";

export {
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    isMetadataObject,
    IAttributeMetadataObject,
    isAttributeMetadataObject,
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
    IFactMetadataObject,
    isFactMetadataObject,
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    IMetadataObjectDefinition,
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
 * @deprecated Use {@link @gooddata/sdk-model#MetadataObject}
 * @public
 */
export type MetadataObject = m.MetadataObject;

/**
 * Get metadata object identifier
 * @deprecated Use {@link @gooddata/sdk-model#metadataObjectId}
 * @public
 */
export const metadataObjectId = m.metadataObjectId;
