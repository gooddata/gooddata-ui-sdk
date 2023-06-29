// (C) 2019-2022 GoodData Corporation
import { GdcScheduledMail } from "@gooddata/api-model-bear";
import {
    IUser,
    uriRef,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";

export const convertScheduledMailAttachment = (
    scheduledMailAttachment: GdcScheduledMail.ScheduledMailAttachment,
): ScheduledMailAttachment | undefined => {
    if (GdcScheduledMail.isKpiDashboardAttachment(scheduledMailAttachment)) {
        const {
            kpiDashboardAttachment: { format, uri, filterContext },
        } = scheduledMailAttachment;

        return {
            dashboard: uriRef(uri),
            format,
            filterContext: filterContext ? uriRef(filterContext) : undefined,
        };
    } else if (GdcScheduledMail.isVisualizationWidgetAttachment(scheduledMailAttachment)) {
        const {
            visualizationWidgetAttachment: { uri, dashboardUri, formats, filterContext, exportOptions },
        } = scheduledMailAttachment;
        const convertedExportOptions = exportOptions
            ? {
                  exportOptions: {
                      includeFilters: exportOptions.includeFilterContext === "yes",
                      mergeHeaders: exportOptions.mergeHeaders === "yes",
                  },
              }
            : {};
        return {
            widgetDashboard: uriRef(dashboardUri),
            widget: uriRef(uri),
            formats,
            filterContext: filterContext ? uriRef(filterContext) : undefined,
            ...convertedExportOptions,
        };
    } else {
        return undefined;
    }
};

export const convertScheduledMail = (
    scheduledMail: GdcScheduledMail.IWrappedScheduledMail,
    userMap?: Map<string, IUser>,
): IScheduledMail | IScheduledMailDefinition => {
    const {
        scheduledMail: {
            content: { attachments, body, subject, to, when, bcc, lastSuccessfull, unsubscribed },
            meta: { uri, identifier, title, summary, unlisted, author, contributor },
        },
    } = scheduledMail;

    const convertedAttachments = compact(attachments.map(convertScheduledMailAttachment));

    return {
        title,
        description: summary!,
        ...(uri
            ? {
                  ref: uriRef(uri),
                  identifier,
                  uri,
              }
            : {}),
        body,
        subject,
        to,
        when: {
            startDate: when.startDate,
            endDate: when.endDate,
            timeZone: when.timeZone,
            recurrence: when.recurrency,
        },
        bcc,
        lastSuccessful: lastSuccessfull,
        unsubscribed,
        attachments: convertedAttachments,
        unlisted: !!unlisted,
        createdBy: author ? userMap?.get(author) : undefined,
        updatedBy: contributor ? userMap?.get(contributor) : undefined,
    };
};
