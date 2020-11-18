// (C) 2019-2020 GoodData Corporation
import { GdcScheduledMail } from "@gooddata/api-model-bear";
import {
    IScheduledMail,
    IScheduledMailDefinition,
    NotSupported,
    ScheduledMailAttachment,
} from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";

export const convertScheduledMailAttachment = (
    scheduledMailAttachment: GdcScheduledMail.ScheduledMailAttachment,
): ScheduledMailAttachment => {
    if (!GdcScheduledMail.isKpiDashboardAttachment(scheduledMailAttachment)) {
        throw new NotSupported(
            "Cannot convert attachment - only dashboard attachments are currently supported.",
        );
    }

    const {
        kpiDashboardAttachment: { format, uri, filterContext },
    } = scheduledMailAttachment;

    const convertedAttachment: ScheduledMailAttachment = {
        dashboard: uriRef(uri),
        format,
        filterContext: filterContext ? uriRef(filterContext) : undefined,
    };

    return convertedAttachment;
};

export const convertScheduledMail = (
    scheduledMail: GdcScheduledMail.IWrappedScheduledMail,
): IScheduledMail | IScheduledMailDefinition => {
    const {
        scheduledMail: {
            content: { attachments, body, subject, to, when, bcc, lastSuccessfull, unsubscribed },
            meta: { uri, identifier, title, summary, unlisted },
        },
    } = scheduledMail;

    const convertedScheduledMail: IScheduledMail | IScheduledMailDefinition = {
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
            ...when,
            recurrence: when.recurrency,
        },
        bcc,
        lastSuccessful: lastSuccessfull,
        unsubscribed,
        attachments: attachments.map(convertScheduledMailAttachment),
        unlisted: !!unlisted,
    };

    return convertedScheduledMail;
};
