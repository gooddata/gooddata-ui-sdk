// (C) 2022-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    LoadingSpinner,
    SELECT_ITEM_ACTION,
    useIdPrefixed,
    useListWithActionsKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { Alert } from "./Alert.js";
import noop from "lodash/noop.js";

interface IAlertsProps {
    onDelete: (alert: IAutomationMetadataObject) => void;
    onEdit: (alert: IAutomationMetadataObject) => void;
    onPause: (alert: IAutomationMetadataObject, pause: boolean) => void;
    isLoading: boolean;
    alerts: IAutomationMetadataObject[];
    noAlertsMessageId: string;
}

const getItemAdditionalActions = () => {
    return ["dropdown" as const];
};

export const Alerts: React.FC<IAlertsProps> = (props) => {
    const { isLoading, alerts, onDelete, onEdit, onPause, noAlertsMessageId } = props;
    const theme = useTheme();

    const handleEdit = React.useCallback((alert: IAutomationMetadataObject) => () => onEdit(alert), [onEdit]);

    const handleTogglePause = React.useCallback(
        (alert: IAutomationMetadataObject) => () => onPause(alert, alert.alert?.trigger.state !== "PAUSED"),
        [onPause],
    );
    const handleDelete = React.useCallback(
        (alert: IAutomationMetadataObject) => () => onDelete(alert),
        [onDelete],
    );

    const { focusedAction, focusedItem, onKeyboardNavigation, setFocusedAction } =
        useListWithActionsKeyboardNavigation({
            items: alerts,
            getItemAdditionalActions,
            actionHandlers: {
                selectItem: handleEdit,
                dropdown: () => noop,
            },
        });

    const listId = useIdPrefixed("AlertsList");

    const handleCloseDropdown = React.useCallback(() => {
        setFocusedAction(SELECT_ITEM_ACTION);
    }, [setFocusedAction]);

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
            className={"gd-notifications-channels-list"}
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
                    onCloseDropdown={handleCloseDropdown}
                    listId={listId}
                />
            ))}
        </div>
    );
};
