// (C) 2022-2025 GoodData Corporation

import { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import {
    IAutomationMetadataObject,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Icon, SELECT_ITEM_ACTION, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { gdColorNegative, gdColorStateBlank } from "../../../constants/colors.js";
import { isVisualisationAutomation } from "../../../../_staging/automation/index.js";
import { useScheduleValidation } from "../../DefaultScheduledEmailDialog/hooks/useScheduleValidation.js";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../model/index.js";

type IAction = "scheduleEmail" | "delete" | typeof SELECT_ITEM_ACTION;

interface IScheduledEmailProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    scheduledEmail: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    focusedAction?: IAction;
}

const ICON_TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 0, y: 0 } },
    { align: "cl cr", offset: { x: 0, y: 0 } },
];
const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export function ScheduledEmail({
    scheduledEmail,
    onDelete,
    onEdit,
    notificationChannels,
    focusedAction,
}: IScheduledEmailProps) {
    const theme = useTheme();

    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const canEdit =
        canManageWorkspace ||
        (currentUser && scheduledEmail.createdBy && currentUser.login === scheduledEmail.createdBy.login);

    const { isValid } = useScheduleValidation(scheduledEmail);
    const intl = useIntl();
    const cronDescription = scheduledEmail.schedule?.cronDescription;
    const webhookTitle = notificationChannels.find(
        (channel) => channel.id === scheduledEmail.notificationChannel,
    )?.title;
    const dashboardTitle = scheduledEmail.exportDefinitions?.find((def) => def.title)?.title;
    const isWidget = isVisualisationAutomation(scheduledEmail);
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const iconColorError = theme?.palette?.error?.base ?? gdColorNegative;
    const iconComponent = !isValid ? (
        <Icon.Warning width={16} height={16} color={iconColorError} />
    ) : isWidget ? (
        <Icon.Insight width={16} height={16} color={iconColor} />
    ) : (
        <Icon.SimplifiedDashboard width={19} height={19} color={iconColor} />
    );

    const subtitle = [cronDescription, webhookTitle, dashboardTitle].filter(Boolean).join(" • ");

    const handleClick = useCallback(() => {
        onEdit(scheduledEmail);
    }, [scheduledEmail]);

    return (
        <div
            className={cx("gd-notifications-channel", "s-scheduled-email", {
                editable: canEdit,
                "gd-schedule-email__item--isFocused": !!focusedAction,
                "gd-schedule-email__item--isFocusedSelectItem": focusedAction === SELECT_ITEM_ACTION,
            })}
        >
            <div className="gd-notifications-channel-content" onClick={canEdit ? handleClick : undefined}>
                <div
                    className={cx("gd-notifications-channel-icon", {
                        "gd-notifications-channel-icon-invalid": !isValid,
                    })}
                >
                    {iconComponent}
                </div>
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
            <div className="gd-notifications-channel-delete">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <span
                        className={cx("gd-notifications-channel-delete-icon s-scheduled-email-delete-icon", {
                            "gd-schedule-email__item__button--isFocused": focusedAction === "delete",
                        })}
                        onClick={() => onDelete(scheduledEmail)}
                    />
                    <Bubble className="bubble-primary" alignPoints={ICON_TOOLTIP_ALIGN_POINTS}>
                        <FormattedMessage id={"dialogs.schedule.management.delete"} />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </div>
    );
}
