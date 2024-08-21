// (C) 2022-2024 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import { AlertActionsDropdown } from "./AlertActionsDropdown.js";

interface IAlertsListItemProps {
    alert: IAutomationMetadataObject;
    onEditAlert: (alert: IAutomationMetadataObject) => void;
    onPauseAlert: (alert: IAutomationMetadataObject) => void;
    onDeleteAlert: (alert: IAutomationMetadataObject) => void;
    onResumeAlert: (alert: IAutomationMetadataObject) => void;
    isInvalid?: boolean;
}

export const AlertsListItem: React.FC<IAlertsListItemProps> = ({
    alert,
    onEditAlert,
    onPauseAlert,
    onDeleteAlert,
    onResumeAlert,
    isInvalid = false,
}) => {
    const isPaused = alert.alert?.trigger?.state === "PAUSED";
    return (
        <div className="gd-alerts-list-item" key={alert.id} onClick={() => onEditAlert(alert)}>
            <div className="gd-alerts-list-item__content s-alert-list-item">
                <div className="gd-alerts-list-item__icon">
                    {isInvalid ? <Icon.Warning /> : isPaused ? <Icon.AlertPaused /> : <Icon.Alert />}
                </div>
                <div className="gd-alerts-list-item__details">
                    <div className="gd-alerts-list-item__title">{alert.title}</div>
                    <div className="gd-alerts-list-item__description">{alert.description}</div>
                </div>
            </div>
            <div className="gd-alerts-list-item__actions">
                <AlertActionsDropdown
                    alert={alert}
                    onEdit={() => onEditAlert(alert)}
                    onPause={() => onPauseAlert(alert)}
                    onDelete={() => onDeleteAlert(alert)}
                    onResume={() => onResumeAlert(alert)}
                    isPaused={isPaused}
                />
            </div>
        </div>
    );
};
