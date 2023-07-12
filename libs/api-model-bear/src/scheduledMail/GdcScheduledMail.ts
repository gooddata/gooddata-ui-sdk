// (C) 2020 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import { DateString, Email, Timestamp, Uri } from "../base/GdcTypes.js";

/**
 * @public
 */
export interface IScheduledMailWhen {
    recurrency: string;
    startDate: DateString;
    timeZone: string;
    endDate?: DateString;
}

/**
 * @public
 */
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

/**
 * @public
 */
export interface IScheduledMail {
    meta: IObjectMeta;
    content: IScheduledMailContent;
}

/**
 * @public
 */
export interface IWrappedScheduledMail {
    scheduledMail: IScheduledMail;
}

/**
 * @public
 */
export type ScheduledMailAttachment =
    | IReportAttachment
    | IDashboardAttachment
    | IKpiDashboardAttachment
    | IVisualizationWidgetAttachment;

/**
 * @public
 */
export type ExportFormat = "xls" | "pdf" | "html" | "csv" | "xlsx";

/**
 * @public
 */
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

/**
 * @public
 */
export interface IReportAttachment {
    reportAttachment: {
        uri?: Uri;
        formats: ExportFormat[];
        exportOptions?: IReportExportOptions;
    };
}

/**
 * @public
 */
export interface IDashboardAttachment {
    dashboardAttachment: {
        uri: Uri;
        allTabs?: boolean;
        tabs: string[];
        executionContext?: Uri;
    };
}

/**
 * @public
 */
export interface IKpiDashboardAttachment {
    kpiDashboardAttachment: {
        uri: Uri;
        format: "pdf";
        filterContext?: Uri;
    };
}

/**
 * @public
 */
export function isKpiDashboardAttachment(obj: unknown): obj is IKpiDashboardAttachment {
    return !isEmpty(obj) && !!(obj as IKpiDashboardAttachment).kpiDashboardAttachment;
}

/**
 * @public
 */
export interface IVisualizationWidgetAttachment {
    visualizationWidgetAttachment: {
        uri: Uri;
        dashboardUri: Uri;
        formats: ("csv" | "xlsx")[];
        filterContext?: Uri;
        exportOptions?: {
            mergeHeaders?: "yes" | "no";
            includeFilterContext?: "yes" | "no";
        };
    };
}

/**
 * @public
 */
export function isVisualizationWidgetAttachment(obj: unknown): obj is IVisualizationWidgetAttachment {
    return !isEmpty(obj) && !!(obj as IVisualizationWidgetAttachment).visualizationWidgetAttachment;
}
