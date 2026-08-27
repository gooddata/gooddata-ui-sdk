// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../base/metadata.js";
import { type ObjRef, isObjRef } from "../objRef/index.js";

import { type IReportContent } from "./content.js";
import { type ReportDateString } from "./variables.js";

/**
 * Payload for creating or updating a report template.
 *
 * @alpha
 */
export interface IReportTemplateDefinition {
    type: "reportTemplate";

    /**
     * Present when updating an existing template.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IReportContent;
}

/**
 * Report template metadata object.
 *
 * @alpha
 */
export interface IReportTemplate extends IReportTemplateDefinition, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Fields shared by report definitions and persisted reports.
 *
 * @alpha
 */
export interface IReportBase {
    title: string;

    description?: string;

    tags?: string[];

    /**
     * Reported period start, ISO 8601 date (YYYY-MM-DD), inclusive.
     *
     * @remarks
     * At execution time the period materializes as an absolute date filter on each
     * visualization slot's dateDataSet (lowest precedence, per-slot opt-out via
     * ignoreReportPeriod). Also available as `{{periodStart}}` in text.
     */
    periodStart: ReportDateString;

    /**
     * Reported period end, ISO 8601 date (YYYY-MM-DD), inclusive.
     */
    periodEnd: ReportDateString;

    /**
     * Content of the report. When created from a template the content is deep-copied
     * and NO reference to the template is kept — the report stays frozen while pages
     * and templates evolve.
     */
    content: IReportContent;

    /**
     * Values for variables declared in content.variables, keyed by variable name.
     */
    variableValues?: Record<string, string>;
}

/**
 * Payload for creating or updating a report.
 *
 * @alpha
 */
export interface IReportDefinition extends IReportBase {
    type: "report";

    /**
     * Present when updating an existing report.
     */
    ref?: ObjRef;
}

/**
 * Report metadata object.
 *
 * @alpha
 */
export interface IReport extends IReportDefinition, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportTemplateDefinition}.
 *
 * @alpha
 */
export function isReportTemplateDefinition(obj: unknown): obj is IReportTemplateDefinition {
    return !isEmpty(obj) && (obj as IReportTemplateDefinition).type === "reportTemplate";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportTemplate}.
 *
 * @alpha
 */
export function isReportTemplate(obj: unknown): obj is IReportTemplate {
    return isReportTemplateDefinition(obj) && isObjRef((obj as IReportTemplate).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportDefinition}.
 *
 * @alpha
 */
export function isReportDefinition(obj: unknown): obj is IReportDefinition {
    return !isEmpty(obj) && (obj as IReportDefinition).type === "report";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReport}.
 *
 * @alpha
 */
export function isReport(obj: unknown): obj is IReport {
    return isReportDefinition(obj) && isObjRef((obj as IReport).ref);
}
