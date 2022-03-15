// (C) 2022 GoodData Corporation

import React from "react";
import { IntlShape, useIntl } from "react-intl";
import {
    isDashboardAttachment,
    isWidgetAttachment,
    IScheduledMail,
    ScheduledMailAttachment,
} from "@gooddata/sdk-backend-spi";
import { Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import compact from "lodash/compact";

interface IScheduledEmailProps {
    scheduledEmail: IScheduledMail;
    currentUserEmail?: string;
}

export const ScheduledEmail: React.FC<IScheduledEmailProps> = (props) => {
    const intl = useIntl();
    const theme = useTheme();

    const { scheduledEmail, currentUserEmail } = props;
    const { subject, to, bcc, attachments } = scheduledEmail;
    const recipients = [...to, ...(bcc ?? [])];
    const recipientsLabel = getRecipientsLabel(intl, recipients, currentUserEmail);
    const formatsLabel = getFormatsLabel(attachments);
    const { AttachmentIcon, attachmentLabel } = getAttachmentType(intl, attachments);

    return (
        <div className="gd-scheduled-email">
            <div className="gd-scheduled-email-icon">
                <AttachmentIcon color={theme?.palette?.complementary?.c5} />
            </div>
            <div>
                <div className="gd-scheduled-email-title">
                    <strong>
                        <ShortenedText
                            className="gd-scheduled-email-title-shortened"
                            tooltipAlignPoints={[{ align: "tc bc", offset: { x: 0, y: 0 } }]}
                        >
                            {subject}
                        </ShortenedText>
                    </strong>
                </div>
                <span className="gd-scheduled-email-subtitle">
                    {recipientsLabel} • {attachmentLabel} • {formatsLabel}
                </span>
            </div>
        </div>
    );
};

const getRecipientsLabel = (intl: IntlShape, recipients: string[], currentUserEmail?: string) => {
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

const getAttachmentType = (intl: IntlShape, attachments: ScheduledMailAttachment[]) => {
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

const getFormatsLabel = (attachments: ScheduledMailAttachment[]) => {
    const hasPdfFormat = attachments.some(isDashboardAttachment);
    const widgetAttachments = attachments.filter(isWidgetAttachment);
    const hasCsvFormat = widgetAttachments.some((attachment) => attachment.formats.includes("csv"));
    const hasXlsxFormat = widgetAttachments.some((attachment) => attachment.formats.includes("xlsx"));

    return compact([hasPdfFormat && "PDF", hasCsvFormat && "CSV", hasXlsxFormat && "XLSX"]).join(", ");
};
