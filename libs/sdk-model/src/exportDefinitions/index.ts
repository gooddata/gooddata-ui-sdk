// (C) 2024 GoodData Corporation

import { ObjRef } from "../index.js";

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

export interface IExportDefinition {
    ref: ObjRef;
    title: string;
    description: string;
    tags: string[];
    requestPayload: IExportDefinitionRequestPayload;
}
