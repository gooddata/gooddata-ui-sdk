// (C) 2022-2024 GoodData Corporation

import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import {
    IAutomationMetadataObject,
    IInsightWidget,
    isInsightWidget,
    IWebhookDefinitionObject,
} from "@gooddata/sdk-model";
import { Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { gdColorStateBlank } from "../../../constants/colors.js";
import { selectWidgetByRef, useDashboardSelector } from "../../../../model/index.js";
import { translateOperator } from "../../DefaultAlertingDialog/operator.js";
import { AlertDropdown } from "./AlertDropdown.js";

interface IAlertProps {
    onDelete: (alert: IAutomationMetadataObject) => void;
    onEdit: (
        alert: IAutomationMetadataObject,
        widget: IInsightWidget | undefined,
        anchor: HTMLElement | null,
        onClosed: () => void,
    ) => void;
    onPause: (alert: IAutomationMetadataObject, pause: boolean) => void;
    alert: IAutomationMetadataObject;
    webhooks: IWebhookDefinitionObject[];
}

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export const Alert: React.FC<IAlertProps> = (props) => {
    const theme = useTheme();

    const { alert, onDelete, onEdit, onPause } = props;

    const intl = useIntl();
    const operator = alert.alert?.condition.operator;
    const threshold = alert.alert?.condition.right;
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;

    const iconActive = <Icon.Alert width={16} height={16} color={iconColor} />;
    const iconPaused = <Icon.AlertPaused width={16} height={16} color={iconColor} />;

    const paused = alert.alert?.trigger.state === "PAUSED";

    const editWidgetId = alert.metadata?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(editWidgetRef));
    const insightWidget = isInsightWidget(widget) ? widget : undefined;
    const widgetName = insightWidget?.title ?? "";

    const subtitle = [`${translateOperator(intl, operator)} ${threshold}`, widgetName]
        .filter(Boolean)
        .join(" • ");

    const [hover, setHover] = useState(false);

    const [dropdownOpened, toggleDropdownOpened] = useState(false);
    const buttonRef = useRef<HTMLElement | null>(null);

    const openDropdown = (e: React.SyntheticEvent) => {
        buttonRef.current = e.currentTarget as HTMLElement;
        toggleDropdownOpened(true);
        setHover(true);
    };

    const closeDropdown = () => {
        toggleDropdownOpened(false);
        setHover(false);
    };

    const handleEdit = useCallback(() => {
        onEdit(alert, insightWidget, buttonRef.current, () => {
            setHover(false);
        });
        closeDropdown();
        setHover(true);
    }, [alert, insightWidget, onEdit]);
    const handleRemove = useCallback(() => {
        onDelete(alert);
        closeDropdown();
    }, [alert, onDelete]);
    const handlePause = useCallback(() => {
        onPause(alert, true);
        closeDropdown();
    }, [alert, onPause]);
    const handleResume = useCallback(() => {
        onPause(alert, false);
        closeDropdown();
    }, [alert, onPause]);

    return (
        <div className={cx("gd-notifications-channel", "s-alert", { editable: true, hover })}>
            <div className="gd-notifications-channel-menu">
                <span
                    className="gd-notifications-channel-menu-icon s-alert-menu-icon"
                    id={`alert-menu-${alert.id}`}
                    onClick={openDropdown}
                />
            </div>
            <div className="gd-notifications-channel-content" onClick={handleEdit}>
                <div className="gd-notifications-channel-icon">{paused ? iconPaused : iconActive}</div>
                <div className="gd-notifications-channel-text-content">
                    <div className="gd-notifications-channel-title">
                        <strong>
                            <ShortenedText
                                className="gd-notifications-channel-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {alert.title ??
                                    intl.formatMessage({ id: "dialogs.alerting.title.placeholder" })}
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
            {dropdownOpened && buttonRef.current ? (
                <AlertDropdown
                    paused={paused}
                    alignTo={buttonRef.current}
                    onClose={closeDropdown}
                    onEdit={handleEdit}
                    onDelete={handleRemove}
                    onPause={handlePause}
                    onResume={handleResume}
                />
            ) : null}
        </div>
    );
};
