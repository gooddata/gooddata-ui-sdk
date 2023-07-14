// (C) 2021 GoodData Corporation
import { Uri } from "../base/GdcTypes.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

/**
 * @public
 */
export interface IReportContent {
    domains: Uri[];
    definitions: Uri[];
}

/**
 * @public
 */
export interface IReport {
    meta: IObjectMeta;
    content: IReportContent;
}

/**
 * @public
 */
export type ReportFormat = "grid" | "chart" | "oneNumber";

/**
 * @public
 */
export interface IReportFilter {
    expression: any;
    tree?: any;
}

/**
 * @public
 */
export interface IGridContentMetrics {
    alias: string;
    uri: Uri;
}

/**
 * @public
 */
export interface IGridContentRowAttribute {
    alias: string;
    totals: any[][];
    uri: Uri;
}

/**
 * @public
 */
export interface IGridContentRow {
    attribute: IGridContentRowAttribute;
}

/**
 * @public
 */
export interface IGridContent {
    sort: IGridContent;
    columnWidths: any[];
    columns: string[];
    metrics: IGridContentMetrics[];
    rows: IGridContentRow[];
}

/**
 * @public
 */
export interface IReportDefinitionContent {
    format: ReportFormat;
    filters: IReportFilter[];
    chart?: any;
    oneNumber?: any;
    sortedLookups?: any;
    grid: IGridContent;
}

/**
 * @public
 */
export interface IReportDefinitionLinks {
    explain2?: string;
}

/**
 * @public
 */
export interface IReportDefinition {
    meta: IObjectMeta;
    content: IReportDefinitionContent;
    links?: IReportDefinitionLinks;
}

/**
 * @public
 */
export interface IWrappedReport {
    report: IReport;
}

/**
 * @public
 */
export interface IWrappedReportDefinition {
    reportDefinition: IReportDefinition;
}
