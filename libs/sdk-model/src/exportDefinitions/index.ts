// (C) 2024 GoodData Corporation

import { IAuditable, IMetadataObject, ObjRef } from "../index.js";

/**
 * Export definition request payload
 *
 * @alpha
 */
export interface IExportDefinitionRequestPayload {
    format: "PDF";
    visualizationObjectRef: ObjRef;
}

/**
 * Export definition
 *
 * @alpha
 */

export interface IExportDefinition extends IMetadataObject, IAuditable {
    type: "exportDefinition";
    tags: string[];
    requestPayload: IExportDefinitionRequestPayload;
}
