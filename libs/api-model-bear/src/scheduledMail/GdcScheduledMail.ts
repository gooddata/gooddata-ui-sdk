// (C) 2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { GdcMetadata } from "../meta/GdcMetadata";
import { DateString, Email, Timestamp, Uri } from "../aliases";

/**
 * @public
 */
export namespace GdcScheduledMail {
    export interface IScheduledMailWhen {
        recurrency: string;
        startDate: DateString;
        timeZone: string;
        endDate?: DateString;
    }

    export interface IScheduledMailContent {
        when: IScheduledMailWhen;
        to: Email[];
        bcc?: Email[];
        unsubscribed?: Email[];
        subject: string;
        body: string;
        attachments: ScheduledMailAttachment[];
        lastSuccessfull?: Timestamp;
    }

    export interface IScheduledMail {
        meta: GdcMetadata.IObjectMeta;
        content: IScheduledMailContent;
    }

    export interface IWrappedScheduledMail {
        scheduledMail: IScheduledMail;
    }

    export type ScheduledMailAttachment =
        | IReportAttachment
        | IDashboardAttachment
        | IKpiDashboardAttachment
        | IVisualizationWidgetAttachment;

    export type ExportFormat = "xls" | "pdf" | "html" | "csv" | "xlsx";

    export interface IReportExportOptions {
        pageOrientation?: "portrait" | "landscape";
        optimalColumnWidth?: "no" | "yes";
        mergeHeaders?: "no" | "yes";
        includeFilterContext?: "no" | "yes";
        urlParams: Array<{ name: string; value: string }>;
        scaling?: {
            pageScalePercentage?: number;
            scaleToPages?: number;
            scaleToPagesX?: number;
            scaleToPagesY?: number;
        };
    }

    export interface IReportAttachment {
        reportAttachment: {
            uri?: Uri;
            formats: ExportFormat[];
            exportOptions?: IReportExportOptions;
        };
    }

    export interface IDashboardAttachment {
        dashboardAttachment: {
            uri: Uri;
            allTabs?: boolean;
            tabs: string[];
            executionContext?: Uri;
        };
    }

    export interface IKpiDashboardAttachment {
        kpiDashboardAttachment: {
            uri: Uri;
            format: "pdf";
            filterContext?: Uri;
        };
    }

    export function isKpiDashboardAttachment(obj: unknown): obj is IKpiDashboardAttachment {
        return !isEmpty(obj) && !!(obj as IKpiDashboardAttachment).kpiDashboardAttachment;
    }

    export interface IVisualizationWidgetAttachment {
        visualizationWidgetAttachment: {
            uri: Uri;
            dashboardUri: Uri;
            formats: ["csv" | "xlsx"];
            filterContext?: Uri;
            exportOptions?: {
                mergeHeaders?: "yes" | "no";
                includeFilterContext?: "yes" | "no";
            };
        };
    }

    export function isVisualizationWidgetAttachment(obj: unknown): obj is IVisualizationWidgetAttachment {
        return !isEmpty(obj) && !!(obj as IVisualizationWidgetAttachment).visualizationWidgetAttachment;
    }
}
