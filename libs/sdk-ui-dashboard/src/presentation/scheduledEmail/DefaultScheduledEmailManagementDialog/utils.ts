// (C) 2022-2024 GoodData Corporation

import { IntlShape } from "react-intl";
import { isDashboardAttachment, isWidgetAttachment, ScheduledMailAttachment } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact.js";

export const getRecipientsLabel = (intl: IntlShape, recipients: string[]) => {
    const numberOfRecipients = recipients.length;
    return intl.formatMessage(
        {
            id: "dialogs.schedule.management.recipients",
        },
        { n: numberOfRecipients },
    );
};

export const getAttachmentType = (intl: IntlShape, attachments: ScheduledMailAttachment[]) => {
    const hasDashboardAttachment = attachments.some(isDashboardAttachment);
    const numberOfWidgetAttachments = attachments.filter(isWidgetAttachment).length;

    if (hasDashboardAttachment && numberOfWidgetAttachments) {
        return {
            AttachmentIcon: Icon.Many,
            attachmentLabel: intl.formatMessage(
                { id: "dialogs.schedule.management.attachments.mixed" },
                { n: numberOfWidgetAttachments },
            ),
        };
    } else if (numberOfWidgetAttachments) {
        return {
            AttachmentIcon: Icon.Insight,
            attachmentLabel: intl.formatMessage(
                { id: "dialogs.schedule.management.attachments.widgets" },
                { n: numberOfWidgetAttachments },
            ),
        };
    } else {
        return {
            AttachmentIcon: Icon.Dashboard,
            attachmentLabel: intl.formatMessage({ id: "dialogs.schedule.management.attachments.dashboard" }),
        };
    }
};

export const getFormatsLabel = (attachments: ScheduledMailAttachment[]) => {
    const hasPdfFormat = attachments.some(isDashboardAttachment);
    const widgetAttachments = attachments.filter(isWidgetAttachment);
    const hasCsvFormat = widgetAttachments.some((attachment) => attachment.formats.includes("csv"));
    const hasXlsxFormat = widgetAttachments.some((attachment) => attachment.formats.includes("xlsx"));

    return compact([hasPdfFormat && "PDF", hasCsvFormat && "CSV", hasXlsxFormat && "XLSX"]).join(", ");
};

/**
 * In order to match backend format, we need to remove milliseconds from the date.
 * Otherwise comparing newly created dates (as ISO string) with ISO dates from backend will fail.
 */
export const toModifiedISOString = (date: Date) => {
    return date.toISOString().split(".")[0] + "Z";
};
