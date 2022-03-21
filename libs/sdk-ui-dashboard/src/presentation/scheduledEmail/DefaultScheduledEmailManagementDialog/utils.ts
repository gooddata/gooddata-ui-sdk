// (C) 2022 GoodData Corporation

import { IntlShape } from "react-intl";
import {
    isDashboardAttachment,
    isWidgetAttachment,
    ScheduledMailAttachment,
} from "@gooddata/sdk-backend-spi";
import { Icon } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact";

export const getRecipientsLabel = (intl: IntlShape, recipients: string[], currentUserEmail?: string) => {
    const numberOfRecipients = recipients.length;
    const recipientsLabel =
        numberOfRecipients === 1 && recipients[0] === currentUserEmail
            ? intl.formatMessage({ id: "dialogs.schedule.management.recipients.onlyYou" })
            : intl.formatMessage(
                  {
                      id: "dialogs.schedule.management.recipients",
                  },
                  { n: numberOfRecipients },
              );

    return recipientsLabel;
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
            AttachmentIcon: Icon.Widget,
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
