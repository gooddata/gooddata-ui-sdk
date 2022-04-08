// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IScheduledMail } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { getAttachmentType, getFormatsLabel, getRecipientsLabel } from "./utils";

interface IScheduledEmailProps {
    onDelete: (scheduledEmail: IScheduledMail) => void;
    onEdit: (scheduledEmail: IScheduledMail) => void;
    scheduledEmail: IScheduledMail;
    currentUserEmail?: string;
}

const ICON_TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 0, y: 0 } },
    { align: "cl cr", offset: { x: 0, y: 0 } },
];
const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export const ScheduledEmail: React.FC<IScheduledEmailProps> = (props) => {
    const intl = useIntl();
    const theme = useTheme();

    const { scheduledEmail, currentUserEmail, onDelete, onEdit } = props;
    const { subject, to, bcc, attachments } = scheduledEmail;
    const recipients = [...to, ...(bcc ?? [])];
    const recipientsLabel = getRecipientsLabel(intl, recipients, currentUserEmail);
    const formatsLabel = getFormatsLabel(attachments);
    const { AttachmentIcon, attachmentLabel } = getAttachmentType(intl, attachments);
    const subtitle = `${recipientsLabel} • ${attachmentLabel} • ${formatsLabel}`;

    return (
        <div className="gd-scheduled-email s-scheduled-email">
            <div className="gd-scheduled-email-delete">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <span
                        className="gd-scheduled-email-delete-icon s-scheduled-email-delete-icon"
                        onClick={() => onDelete(scheduledEmail)}
                    />
                    <Bubble className="bubble-primary" alignPoints={ICON_TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id={"dialogs.schedule.management.delete"} />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
            <div className="gd-scheduled-email-content" onClick={() => onEdit(scheduledEmail)}>
                <div className="gd-scheduled-email-icon">
                    <AttachmentIcon color={theme?.palette?.complementary?.c5} />
                </div>
                <div className="gd-scheduled-email-text-content">
                    <div className="gd-scheduled-email-title">
                        <strong>
                            <ShortenedText
                                className="gd-scheduled-email-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {subject}
                            </ShortenedText>
                        </strong>
                    </div>
                    <div>
                        <span className="gd-scheduled-email-subtitle">
                            <ShortenedText
                                className="gd-scheduled-email-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {subtitle}
                            </ShortenedText>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
