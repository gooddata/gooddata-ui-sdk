// (C) 2024 GoodData Corporation

import { invariant } from "ts-invariant";
import { Identifier } from "../objRef/index.js";
import { IFilter } from "../execution/filter/index.js";
import { IMetadataObject } from "../ldm/metadata/index.js";
import { IAuditable } from "../base/metadata.js";

/**
 * Export definition PDF Options
 *
 * @alpha
 */
export interface IExportDefinitionPdfOptions {
    orientation: "portrait" | "landscape";
}

/**
 * Export definition request payload
 *
 * @alpha
 */
export interface IExportDefinitionRequestPayload {
    format: "PDF";
    visualizationObjectId: Identifier;
    filters?: IFilter[];
    pdfOptions?: IExportDefinitionPdfOptions;
}

/**
 * Export definition base
 * An object containing the core properties of an export definition
 *
 * @alpha
 */
export interface IExportDefinitionBase {
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

/**
 * Gets the exportDefinition title
 *
 * @param exportDefinition - exportDefinition to get title of
 * @returns string - the exportDefinition title
 * @alpha
 */
export function exportDefinitionTitle(exportDefinition: IExportDefinition): string {
    invariant(exportDefinition, "export definition to get title from must be specified");

    return exportDefinition.title;
}

/**
 * Gets the date when the exportDefinition was created
 *
 * @param exportDefinition - exportDefinition
 * @returns string - YYYY-MM-DD HH:mm:ss
 * @alpha
 */
export function exportDefinitionCreated(exportDefinition: IExportDefinition): string | undefined {
    invariant(exportDefinition, "export definition must be specified");

    return exportDefinition.created;
}

/**
 * Gets the date of the last exportDefinition update
 *
 * @param exportDefinition - exportDefinition
 * @returns string - YYYY-MM-DD HH:mm:ss
 * @alpha
 */
export function exportDefinitionUpdated(exportDefinition: IExportDefinition): string | undefined {
    invariant(exportDefinition, "export definition must be specified");

    return exportDefinition.updated;
}
