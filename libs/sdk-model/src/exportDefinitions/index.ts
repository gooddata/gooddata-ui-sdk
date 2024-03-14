// (C) 2024 GoodData Corporation

import { IAuditable, IFilter, IMetadataObject, Identifier } from "../index.js";

/**
 * Export definition request payload
 *
 * @alpha
 */
export interface IExportDefinitionRequestPayload {
    format: "PDF";
    visualizationObjectId: Identifier;
    filters?: IFilter[];
    pdfOptions?: any; // todo: define pdf options from tabular exporter
}

/**
 * Export definition base
 * An object containing the core properties of an export definition
 *
 * @alpha
 */
export interface IExportDefinitionBase {
    id: Identifier;
    title: string;
    description: string;
    tags: string[];
    requestPayload: IExportDefinitionRequestPayload;
}

/**
 * Export definition
 *
 * @alpha
 */

export interface IExportDefinition extends IExportDefinitionBase, IMetadataObject, IAuditable {
    type: "exportDefinition";
}
