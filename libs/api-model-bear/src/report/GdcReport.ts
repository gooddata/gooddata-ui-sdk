// (C) 2021 GoodData Corporation

import { GdcMetadata } from "../meta/GdcMetadata";
import IObjectMeta = GdcMetadata.IObjectMeta;
import { Uri } from "../aliases";

/**
 * @public
 */
export namespace GdcReport {
    export interface IReportContent {
        domains: Uri[];
        definitions: Uri[];
    }

    export interface IReport {
        meta: IObjectMeta;
        content: IReportContent;
    }

    export type ReportFormat = "grid" | "chart" | "oneNumber";

    export interface IReportFilter {
        expression: any;
        tree?: any;
    }

    export interface IGridContentMetrics {
        alias: string;
        uri: Uri;
    }

    export interface IGridContentRowAttribute {
        alias: string;
        totals: any[][];
        uri: Uri;
    }

    export interface IGridContentRow {
        attribute: IGridContentRowAttribute;
    }

    export interface IGridContent {
        sort: IGridContent;
        columnWidths: any[];
        columns: string[];
        metrics: IGridContentMetrics[];
        rows: IGridContentRow[];
    }

    export interface IReportDefinitionContent {
        format: ReportFormat;
        filters: IReportFilter[];
        chart?: any;
        oneNumber?: any;
        sortedLookups?: any;
        grid: IGridContent;
    }

    export interface IReportDefinitionLinks {
        explain2?: string;
    }

    export interface IReportDefinition {
        meta: IObjectMeta;
        content: IReportDefinitionContent;
        links?: IReportDefinitionLinks;
    }

    export interface IWrappedReport {
        report: IReport;
    }

    export interface IWrappedReportDefinition {
        reportDefinition: IReportDefinition;
    }
}
