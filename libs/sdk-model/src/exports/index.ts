// (C) 2024-2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";

import { IAuditable } from "../base/metadata.js";
import { FilterContextItem } from "../dashboard/filterContext.js";
import { IFilter } from "../execution/filter/index.js";
import { IMetadataObject, IMetadataObjectDefinition } from "../ldm/metadata/index.js";
import { Identifier } from "../objRef/index.js";

/**
 * Export definition dashboard settings
 *
 * @alpha
 */
export interface IExportDefinitionDashboardSettings {
    mergeHeaders?: boolean;
    exportInfo?: boolean;
    orientation?: "portrait" | "landscape";
}

/**
 * Export definition visualization object settings
 *
 * @alpha
 */
export interface IExportDefinitionVisualizationObjectSettings {
    mergeHeaders?: boolean;
    exportInfo?: boolean;
    orientation?: "portrait" | "landscape";
}

/**
 * Export definition visualization content configuration.
 *
 * @alpha
 */
export interface IExportDefinitionVisualizationObjectContent {
    visualizationObject: Identifier;
    /**
     * Widget context of visualization object.
     */
    widget?: Identifier;
    /**
     * Dashboard context of visualization object.
     */
    dashboard?: Identifier;
    filters?: IFilter[] | FilterContextItem[];
}

/**
 * Export definition dashboard content configuration.
 *
 * @remarks Filter has to be in FilterContextItem shape so that dashboard can easily consume it.
 *
 * @alpha
 */
export interface IExportDefinitionDashboardContent {
    dashboard: Identifier;
    filters?: FilterContextItem[];
}

/**
 * Dashboard attachment types.
 * @alpha
 */
export type DashboardAttachmentType = "PDF" | "XLSX" | "PPTX" | "PDF_SLIDES";

/**
 * Export definition dashboard request payload
 *
 * @alpha
 */
export type IExportDefinitionDashboardRequestPayload = {
    type: "dashboard";
    fileName: string;
    format: DashboardAttachmentType;
    settings?: IExportDefinitionDashboardSettings;
    content: IExportDefinitionDashboardContent;
};

/**
 * Type guard to check if the object is of type IExportDefinitionDashboardRequestPayload.
 * @alpha
 */
export function isExportDefinitionDashboardRequestPayload(
    obj: unknown,
): obj is IExportDefinitionDashboardRequestPayload {
    return !isEmpty(obj) && (obj as IExportDefinitionDashboardRequestPayload).type === "dashboard";
}

/**
 * Widget attachment types.
 * @alpha
 */
export type WidgetAttachmentType = "CSV" | "XLSX" | "CSV_RAW" | "PNG" | "PPTX" | "PDF" | "HTML";

/**
 * Export definition visualization object request payload
 *
 * @alpha
 */
export type IExportDefinitionVisualizationObjectRequestPayload = {
    type: "visualizationObject";
    fileName: string;
    format: WidgetAttachmentType;
    settings?: IExportDefinitionVisualizationObjectSettings;
    content: IExportDefinitionVisualizationObjectContent;
};

/**
 * Type guard to check if the object is of type IExportDefinitionVisualizationObjectRequestPayload.
 * @alpha
 */
export function isExportDefinitionVisualizationObjectRequestPayload(
    obj: unknown,
): obj is IExportDefinitionVisualizationObjectRequestPayload {
    return (
        !isEmpty(obj) &&
        (obj as IExportDefinitionVisualizationObjectRequestPayload).type === "visualizationObject"
    );
}

/**
 * Export definition request payload
 *
 * @alpha
 */
export type IExportDefinitionRequestPayload =
    | IExportDefinitionDashboardRequestPayload
    | IExportDefinitionVisualizationObjectRequestPayload;

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

/**
 * Export result.
 *
 * @public
 */
export interface IExportResult {
    /**
     * File name.
     */
    fileName: string;

    /**
     * Export ID.
     */
    exportId: string;

    /**
     * Export status.
     */
    status: IExportResultStatus;

    /**
     * File URI.
     */
    fileUri?: string;

    /**
     * Error message.
     */
    errorMessage?: string;

    /**
     * Trace ID.
     */
    traceId?: string;

    /**
     * Export expiration date.
     */
    expiresAt?: string;
}

/**
 * Export result status.
 *
 * @public
 */
export type IExportResultStatus = "SUCCESS" | "ERROR" | "INTERNAL_ERROR" | "TIMEOUT";
