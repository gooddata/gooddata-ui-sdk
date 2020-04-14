// (C) 2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import { DateString, Email, Timestamp, Uri } from "../aliases";

/**
 * @public
 */
export namespace GdcScheduledMail {
    export interface IScheduledMail {
        meta: GdcMetadata.IObjectMeta;
        content: {
            when: {
                recurrency: string;
                startDate: DateString;
                timeZone: string;
                endDate?: DateString;
            };
            to: Email[];
            bcc?: Email[];
            unsubscribed?: Email[];
            subject: string;
            body: string;
            attachments: ScheduledMailAttachment;
            lastSuccessfull?: Timestamp;
        };
    }

    export interface IWrappedScheduledMail {
        scheduledMail: IScheduledMail;
    }

    export type ScheduledMailAttachment = IReportAttachment | IDashboardAttachment | IKpiDashboardAttachment;

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
        uri?: Uri;
        formats: ExportFormat[];
        exportOptions?: IReportExportOptions;
    }

    export interface IDashboardAttachment {
        uri: Uri;
        allTabs?: boolean;
        tabs: string[];
        executionContext?: Uri;
    }

    export interface IKpiDashboardAttachment {
        uri: Uri;
        format: "pdf";
        filterContext?: Uri;
    }
}
