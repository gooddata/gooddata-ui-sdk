// (C) 2024-2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { invariant } from "ts-invariant";

import { type IAuditable } from "../base/metadata.js";
import { type FilterContextItem } from "../dashboard/filterContext.js";
import { type IDashboardExportParameter } from "../dashboard/parameter.js";
import { type IFilter } from "../execution/filter/index.js";
import { type IMetadataObject, type IMetadataObjectDefinition } from "../ldm/metadata/types.js";
import { type Identifier, type ObjRef } from "../objRef/index.js";

/**
 * Export type a slide template applies to.
 *
 * @beta
 */
export type ExportTemplateAppliedOn = "PDF" | "PPTX";

/**
 * Running (header or footer) section of a slide.
 *
 * @remarks
 * Each side is either the `{{logo}}` variable or a custom text combined with other template variables.
 *
 * @beta
 */
export interface IExportTemplateRunningSection {
    /**
     * Left-aligned content.
     */
    left?: string | null;

    /**
     * Right-aligned content.
     */
    right?: string | null;
}

/**
 * Settings for a content slide.
 *
 * @beta
 */
export interface IExportTemplateContentSlide {
    header?: IExportTemplateRunningSection | null;
    footer?: IExportTemplateRunningSection | null;
    descriptionField?: string | null;
}

/**
 * Settings for a cover slide.
 *
 * @beta
 */
export interface IExportTemplateCoverSlide {
    header?: IExportTemplateRunningSection | null;
    footer?: IExportTemplateRunningSection | null;
    descriptionField?: string | null;

    /**
     * Show a background image on the slide.
     */
    backgroundImage?: boolean;
}

/**
 * Settings for an intro slide.
 *
 * @beta
 */
export interface IExportTemplateIntroSlide {
    header?: IExportTemplateRunningSection | null;
    footer?: IExportTemplateRunningSection | null;
    titleField?: string | null;
    descriptionField?: string | null;

    /**
     * Show a background image on the slide.
     */
    backgroundImage?: boolean;
}

/**
 * Settings for a section slide.
 *
 * @beta
 */
export interface IExportTemplateSectionSlide {
    header?: IExportTemplateRunningSection | null;
    footer?: IExportTemplateRunningSection | null;

    /**
     * Show a background image on the slide.
     */
    backgroundImage?: boolean;
}

/**
 * Template describing how a dashboard is rendered into slides.
 *
 * @beta
 */
export interface IExportTemplateDashboardSlides {
    /**
     * Export types this template applies to.
     */
    appliedOn: ExportTemplateAppliedOn[];
    coverSlide?: IExportTemplateCoverSlide | null;
    introSlide?: IExportTemplateIntroSlide | null;
    sectionSlide?: IExportTemplateSectionSlide | null;
    contentSlide?: IExportTemplateContentSlide | null;
}

/**
 * Template describing how a single widget is rendered into slides.
 *
 * @beta
 */
export interface IExportTemplateWidgetSlides {
    /**
     * Export types this template applies to.
     */
    appliedOn: ExportTemplateAppliedOn[];
    contentSlide?: IExportTemplateContentSlide | null;
}

/**
 * Export template payload used to create or update an export template.
 *
 * @beta
 */
export interface IExportTemplateDefinition {
    /**
     * User-facing name of the export template.
     */
    name: string;

    /**
     * Template applied to dashboard slide exports.
     */
    dashboardSlidesTemplate?: IExportTemplateDashboardSlides | null;

    /**
     * Template applied to single-widget slide exports.
     */
    widgetSlidesTemplate?: IExportTemplateWidgetSlides | null;
}

/**
 * Export template metadata.
 *
 * @beta
 */
export interface IExportTemplate extends IExportTemplateDefinition {
    /**
     * Reference to the export template.
     */
    ref: ObjRef;

    /**
     * Whether the template is inherited from a parent (a parent workspace or the organization) and is
     * therefore read-only in the current scope. Native templates (created here) are editable.
     */
    isInherited?: boolean;
}

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
    pageSize?: "A3" | "A4" | "LETTER";
    orientation?: "portrait" | "landscape";
    grandTotalsPosition?: "pinnedBottom" | "pinnedTop" | "bottom" | "top";
    delimiter?: string;
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
    /**
     * Parameter runtime-overrides applied on export, keyed by the owning tab's localIdentifier.
     */
    parametersByTab?: Record<string, IDashboardExportParameter[]>;
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
    filtersByTab?: Record<string, FilterContextItem[]>;
    /**
     * Parameter runtime-overrides applied on export, keyed by tab localIdentifier.
     */
    parametersByTab?: Record<string, IDashboardExportParameter[]>;
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
    /**
     * Identifier of the export template to use for slide exports.
     */
    templateId?: string;
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
export type WidgetAttachmentType =
    | "CSV"
    | "XLSX"
    | "CSV_RAW"
    | "PNG"
    | "PPTX"
    | "PDF"
    | "PDF_TABULAR"
    | "HTML";

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
    /**
     * Identifier of the export template to use for slide exports.
     */
    templateId?: string;
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
    extends IExportDefinitionBase, IMetadataObjectDefinition {
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
