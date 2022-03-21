// (C) 2022 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { IScheduledMail } from "@gooddata/sdk-backend-spi";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { getAttachmentType, getFormatsLabel, getRecipientsLabel } from "./utils";

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
