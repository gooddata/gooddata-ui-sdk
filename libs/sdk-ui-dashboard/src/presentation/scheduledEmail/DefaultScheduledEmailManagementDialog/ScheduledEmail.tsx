// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { IScheduledMail, IWorkspaceUser } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { getAttachmentType, getFormatsLabel, getRecipientsLabel } from "./utils.js";

import { gdColorDisabled } from "../../constants/colors.js";

interface IScheduledEmailProps {
    onDelete: (scheduledEmail: IScheduledMail) => void;
    onEdit: (scheduledEmail: IScheduledMail, users: IWorkspaceUser[]) => void;
    scheduledEmail: IScheduledMail;
    currentUserEmail?: string;
    canManageScheduledMail: boolean;
    users: IWorkspaceUser[];
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

    const { scheduledEmail, currentUserEmail, onDelete, onEdit, canManageScheduledMail, users } = props;
    const { subject, to, bcc, attachments } = scheduledEmail;
    const recipients = [...to, ...(bcc ?? [])];
    const recipientsLabel = getRecipientsLabel(intl, recipients, currentUserEmail);
    const formatsLabel = getFormatsLabel(attachments);
    const { AttachmentIcon, attachmentLabel } = getAttachmentType(intl, attachments);
    const subtitle = `${recipientsLabel} • ${attachmentLabel} • ${formatsLabel}`;

    const handleClick = useCallback(() => {
        if (canManageScheduledMail) {
            onEdit(scheduledEmail, users);
        }
    }, [scheduledEmail, canManageScheduledMail, users]);

    return (
        <div className={cx("gd-scheduled-email", "s-scheduled-email", { editable: canManageScheduledMail })}>
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
            <div className="gd-scheduled-email-content" onClick={handleClick}>
                <div className="gd-scheduled-email-icon">
                    <AttachmentIcon
                        color={theme?.palette?.complementary?.c5 ?? gdColorDisabled}
                        width={18}
                        height={16}
                    />
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
