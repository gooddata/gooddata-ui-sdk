// (C) 2024 GoodData Corporation

import { invariant } from "ts-invariant";
import { Identifier } from "../objRef/index.js";
import { IFilter } from "../execution/filter/index.js";
import { IMetadataObject, IMetadataObjectDefinition } from "../ldm/metadata/index.js";
import { IAuditable } from "../base/metadata.js";
import isEmpty from "lodash/isEmpty.js";

/**
 * Export definition PDF Options
 *
 * @alpha
 */
export interface IExportDefinitionPdfOptions {
    orientation: "portrait" | "landscape";
}

/**
 * Export definition visualization content configuration.
 *
 * @alpha
 */
export interface IExportDefinitionVisualizationObjectContent {
    visualizationObject: Identifier;
    filters?: IFilter[];
}

/**
 * Type guard to check if the object is of type IExportDefinitionVisualizationObjectContent.
 * @alpha
 */
export function isExportDefinitionVisualizationObjectContent(
    obj: unknown,
): obj is IExportDefinitionVisualizationObjectContent {
    return (
        !isEmpty(obj) &&
        typeof (obj as IExportDefinitionVisualizationObjectContent).visualizationObject === "string"
    );
}

/**
 * Export definition dashboard content configuration.
 *
 * @alpha
 */
export interface IExportDefinitionDashboardContent {
    dashboard: string;
    filters?: IFilter[];
}

/**
 * Type guard to check if the object is of type IExportDefinitionDashboardContent.
 * @alpha
 */
export function isExportDefinitionDashboardContent(obj: unknown): obj is IExportDefinitionDashboardContent {
    return !isEmpty(obj) && typeof (obj as IExportDefinitionDashboardContent).dashboard === "string";
}

/**
 * Export definition content configuration.
 *
 * @alpha
 */
export type IExportDefinitionContent =
    | IExportDefinitionVisualizationObjectContent
    | IExportDefinitionDashboardContent;

/**
 * Export definition request payload
 *
 * @alpha
 */
export type IExportDefinitionRequestPayload = {
    fileName: string;
    format: "PDF";
    pdfOptions?: IExportDefinitionPdfOptions;
    content: IExportDefinitionContent;
};

/**
 * Export definition base
 * An object containing the core properties of an export definition
 *
 * @alpha
 */
export interface IExportDefinitionBase {
    requestPayload: IExportDefinitionRequestPayload;
}

/**
 * Export definition
 *
 * @alpha
 */
export interface IExportDefinitionMetadataObject extends IExportDefinitionBase, IMetadataObject, IAuditable {
    type: "exportDefinition";
}

/**
 * Export definition
 *
 * @alpha
 */
export interface IExportDefinitionMetadataObjectDefinition
    extends IExportDefinitionBase,
        IMetadataObjectDefinition {
    type: "exportDefinition";
}

/**
 * Gets the exportDefinition title
 *
 * @param exportDefinition - exportDefinition to get title of
 * @returns string - the exportDefinition title
 * @alpha
 */
export function exportDefinitionTitle(exportDefinition: IExportDefinitionMetadataObject): string {
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
export function exportDefinitionCreated(
    exportDefinition: IExportDefinitionMetadataObject,
): string | undefined {
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
export function exportDefinitionUpdated(
    exportDefinition: IExportDefinitionMetadataObject,
): string | undefined {
    invariant(exportDefinition, "export definition must be specified");

    return exportDefinition.updated;
}
