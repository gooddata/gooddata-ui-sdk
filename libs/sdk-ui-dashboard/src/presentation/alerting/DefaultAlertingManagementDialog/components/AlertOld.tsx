// (C) 2022-2025 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IAutomationMetadataObject, IInsightWidget, isInsightWidget } from "@gooddata/sdk-model";
import { IconAlert, IconAlertPaused, IconWarning, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { AlertDropdown } from "./AlertDropdown.js";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    selectSeparators,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { gdColorNegative, gdColorStateBlank } from "../../../constants/colors.js";
import { useAlertValidation } from "../../DefaultAlertingDialog/hooks/useAlertValidation.js";
import { getSubtitle } from "../../DefaultAlertingDialog/utils/getters.js";

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
}

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export function AlertOld({ alert, onDelete, onEdit, onPause }: IAlertProps) {
    const theme = useTheme();

    const intl = useIntl();
    const { isValid } = useAlertValidation(alert);
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const iconColorError = theme?.palette?.error?.base ?? gdColorNegative;

    const iconActive = <IconAlert width={16} height={16} color={iconColor} />;
    const iconPaused = <IconAlertPaused width={16} height={16} color={iconColor} />;
    const iconError = <IconWarning width={16} height={16} color={iconColorError} />;

    const paused = alert.alert?.trigger.state === "PAUSED";

    const editWidgetId = alert.metadata?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(editWidgetRef));
    const insightWidget = isInsightWidget(widget) ? widget : undefined;
    const widgetName = insightWidget?.title ?? "";

    const separators = useDashboardSelector(selectSeparators);
    const subtitle = getSubtitle(intl, widgetName, alert, separators);

    const [hover, setHover] = useState(false);

    const [dropdownOpened, toggleDropdownOpened] = useState(false);
    const buttonRef = useRef<HTMLElement | null>(null);

    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const canEdit =
        canManageWorkspace || (currentUser && alert.createdBy && currentUser.login === alert.createdBy.login);

    const openDropdown = () => {
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
        <div
            className={cx("gd-notifications-channel gd-notifications-channel-old", "s-alert", {
                editable: false,
                hover,
            })}
        >
            {dropdownOpened && buttonRef.current ? (
                <AlertDropdown
                    isReadOnly={!canEdit}
                    paused={paused}
                    alignTo={buttonRef.current}
                    onClose={closeDropdown}
                    onEdit={handleEdit}
                    onDelete={handleRemove}
                    onPause={handlePause}
                    onResume={handleResume}
                />
            ) : null}
            <div className="gd-notifications-channel-menu">
                <span
                    className="gd-notifications-channel-menu-icon s-alert-menu-icon"
                    id={`alert-menu-${alert.id}`}
                    ref={buttonRef}
                    onClick={openDropdown}
                />
            </div>
            <div className="gd-notifications-channel-content" onClick={canEdit ? handleEdit : undefined}>
                <div
                    className={cx("gd-notifications-channel-icon", {
                        "gd-notifications-channel-icon-invalid": !isValid,
                    })}
                >
                    {isValid ? (paused ? iconPaused : iconActive) : iconError}
                </div>
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
        </div>
    );
}
