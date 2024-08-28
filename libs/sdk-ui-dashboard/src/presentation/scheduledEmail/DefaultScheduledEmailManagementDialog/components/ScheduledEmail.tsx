// (C) 2022-2024 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import {
    IAutomationMetadataObject,
    ISmtpDefinitionObject,
    IWebhookDefinitionObject,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { gdColorStateBlank } from "../../../constants/colors.js";
import { isVisualisationAutomation } from "../../DefaultScheduledEmailDialog/utils/automationHelpers.js";

interface IScheduledEmailProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    scheduledEmail: IAutomationMetadataObject;
    webhooks: IWebhookDefinitionObject[];
    emails: ISmtpDefinitionObject[];
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

    const { scheduledEmail, onDelete, onEdit, webhooks, emails } = props;

    const intl = useIntl();
    const cronDescription = scheduledEmail.schedule?.cronDescription;
    const webhookTitle = [...webhooks, ...emails].find(
        (channel) => channel.id === scheduledEmail.notificationChannel,
    )?.destination?.name;
    const dashboardTitle = scheduledEmail.exportDefinitions?.[0]?.title;
    const isWidget = isVisualisationAutomation(scheduledEmail);
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const iconComponent = isWidget ? (
        <Icon.Insight width={16} height={16} color={iconColor} />
    ) : (
        <Icon.SimplifiedDashboard width={19} height={19} color={iconColor} />
    );

    const subtitle = [cronDescription, webhookTitle, dashboardTitle].filter(Boolean).join(" • ");

    const handleClick = useCallback(() => {
        onEdit(scheduledEmail);
    }, [scheduledEmail, onEdit]);

    return (
        <div className={cx("gd-notifications-channel", "s-scheduled-email", { editable: true })}>
            <div className="gd-notifications-channel-delete">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <span
                        className="gd-notifications-channel-delete-icon s-scheduled-email-delete-icon"
                        onClick={() => onDelete(scheduledEmail)}
                    />
                    <Bubble className="bubble-primary" alignPoints={ICON_TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id={"dialogs.schedule.management.delete"} />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
            <div className="gd-notifications-channel-content" onClick={handleClick}>
                <div className="gd-notifications-channel-icon">{iconComponent}</div>
                <div className="gd-notifications-channel-text-content">
                    <div className="gd-notifications-channel-title">
                        <strong>
                            <ShortenedText
                                className="gd-notifications-channel-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {scheduledEmail.title ??
                                    intl.formatMessage({ id: "dialogs.schedule.email.title.placeholder" })}
                            </ShortenedText>
                        </strong>
                    </div>
                    <div>
                        <span className="gd-notifications-channel-subtitle">
                            <ShortenedText
                                className="gd-notifications-channel-shortened-text"
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
