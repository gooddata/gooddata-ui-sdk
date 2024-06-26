// (C) 2022-2024 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IAutomationMetadataObject, IWebhookMetadataObject } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { gdColorDisabled } from "../../../constants/colors.js";

interface IScheduledEmailProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    scheduledEmail: IAutomationMetadataObject;
    canManageScheduledMail: boolean;
    webhooks: IWebhookMetadataObject[];
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
    const theme = useTheme();

    const { scheduledEmail, onDelete, onEdit, canManageScheduledMail, webhooks } = props;

    const parsedCron = scheduledEmail.schedule?.cron;
    const webhookTitle = webhooks.find((webhook) => webhook.id === scheduledEmail.webhook)?.name;
    const dashboardTitle = scheduledEmail.exportDefinitions?.[0]?.title;

    const subtitle = [parsedCron, webhookTitle, dashboardTitle].join(" • ");

    const handleClick = useCallback(() => {
        if (canManageScheduledMail) {
            onEdit(scheduledEmail);
        }
    }, [scheduledEmail, canManageScheduledMail, onEdit]);

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
                    <Icon.Schedule
                        color={theme?.palette?.complementary?.c5 ?? gdColorDisabled}
                        width={14}
                        height={14}
                    />
                </div>
                <div className="gd-scheduled-email-text-content">
                    <div className="gd-scheduled-email-title">
                        <strong>
                            <ShortenedText
                                className="gd-scheduled-email-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {scheduledEmail.title ?? ""}
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
