// (C) 2022-2025 GoodData Corporation
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { LoadingSpinner, useIdPrefixed, useListWithActionsKeyboardNavigation } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { Alert } from "./Alert.js";

interface IAlertsProps {
    onDelete: (alert: IAutomationMetadataObject) => void;
    onEdit: (alert: IAutomationMetadataObject) => void;
    onPause: (alert: IAutomationMetadataObject, pause: boolean) => void;
    isLoading: boolean;
    alerts: IAutomationMetadataObject[];
    noAlertsMessageId: string;
}

const getItemAdditionalActions = () => {
    return ["dropdown" as const, "item" as const];
};

export function Alerts({ isLoading, alerts, onDelete, onEdit, onPause, noAlertsMessageId }: IAlertsProps) {
    const theme = useTheme();

    const handleEdit = useCallback((alert: IAutomationMetadataObject) => () => onEdit(alert), [onEdit]);

    const handleTogglePause = useCallback(
        (alert: IAutomationMetadataObject) => () => onPause(alert, alert.alert?.trigger.state !== "PAUSED"),
        [onPause],
    );
    const handleDelete = useCallback((alert: IAutomationMetadataObject) => () => onDelete(alert), [onDelete]);

    const [dropdownOpenAlertId, setDropdownOpenAlertId] = useState<string | null>(null);
    const handleToggleDropdown = useCallback(
        (alert: IAutomationMetadataObject) => (desiredState?: boolean) => {
            setDropdownOpenAlertId((prev) => {
                const nextState = desiredState ?? !prev;

                return nextState ? alert.id : null;
            });
        },
        [],
    );

    const { focusedAction, focusedItem, onKeyboardNavigation } = useListWithActionsKeyboardNavigation({
        items: alerts,
        getItemAdditionalActions,
        actionHandlers: {
            selectItem: handleEdit,
            item: handleEdit,
            dropdown: (alert) => () => {
                handleToggleDropdown(alert)(true);
            },
        },
        isNestedList: true,
    });

    const listId = useIdPrefixed("AlertsList");

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap gd-notifications-channels-message">
                <div className="gd-loading-equalizer gd-loading-equalizer-fade">
                    <LoadingSpinner
                        className="large gd-loading-equalizer-spinner"
                        color={theme?.palette?.complementary?.c9}
                    />
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="gd-notifications-channels-message s-no-alerts-message">
                <FormattedMessage id={noAlertsMessageId} values={{ br: <br /> }} />
            </div>
        );
    }

    return (
        <div
            onKeyDown={onKeyboardNavigation}
            tabIndex={0}
            className={"gd-alerts-list__items gd-alerts-list--dialog"}
            id={listId}
        >
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    alert={alert}
                    focusedAction={alert === focusedItem ? focusedAction : undefined}
                    onDelete={handleDelete(alert)}
                    onEdit={handleEdit(alert)}
                    onTogglePause={handleTogglePause(alert)}
                    listId={listId}
                    isDropdownOpen={dropdownOpenAlertId === alert.id}
                    onToggleDropdown={handleToggleDropdown(alert)}
                    isSubtitleVisible
                />
            ))}
        </div>
    );
}
