// (C) 2022-2024 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { AlertActionsDropdown } from "./AlertActionsDropdown.js";
import { getAlertThreshold, getOperatorTitle } from "./utils.js";
import { gdColorNegative } from "../../../../constants/colors.js";
import { useAlertValidation } from "./hooks/useAlertValidation.js";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../../model/index.js";

interface IAlertsListItemProps {
    alert: IAutomationMetadataObject;
    onEditAlert: (alert: IAutomationMetadataObject) => void;
    onPauseAlert: (alert: IAutomationMetadataObject) => void;
    onDeleteAlert: (alert: IAutomationMetadataObject) => void;
    onResumeAlert: (alert: IAutomationMetadataObject) => void;
}

export const AlertsListItem: React.FC<IAlertsListItemProps> = ({
    alert,
    onEditAlert,
    onPauseAlert,
    onDeleteAlert,
    onResumeAlert,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const isPaused = alert.alert?.trigger?.state === "PAUSED";
    const description = `${getOperatorTitle(intl, alert.alert)} ${getAlertThreshold(alert.alert)}`;
    const { isValid } = useAlertValidation(alert);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const canEdit =
        canManageWorkspace || (currentUser && alert.createdBy && currentUser.login === alert.createdBy.login);

    return (
        <div
            className={cx("gd-alerts-list-item", { "gd-alerts-list-item--readonly": !canEdit })}
            key={alert.id}
            onClick={canEdit ? () => onEditAlert(alert) : undefined}
        >
            <div className="gd-alerts-list-item__content s-alert-list-item">
                <div
                    className={cx("gd-alerts-list-item__icon", {
                        "gd-alerts-list-item__icon-invalid": !isValid,
                    })}
                >
                    {!isValid ? (
                        <Icon.Warning color={theme?.palette?.error?.base ?? gdColorNegative} />
                    ) : isPaused ? (
                        <Icon.AlertPaused width={13} height={13} />
                    ) : (
                        <Icon.Alert width={11} height={13} />
                    )}
                </div>
                <div className="gd-alerts-list-item__details">
                    <div className="gd-alerts-list-item__title">{alert.title}</div>
                    <div className="gd-alerts-list-item__description">{description}</div>
                </div>
            </div>
            <div className="gd-alerts-list-item__actions">
                <AlertActionsDropdown
                    isReadOnly={!canEdit}
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
