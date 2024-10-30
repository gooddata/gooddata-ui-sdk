// (C) 2022-2024 GoodData Corporation
import React from "react";
import { IntlShape, useIntl } from "react-intl";
import { IAutomationMetadataObject, ISeparators } from "@gooddata/sdk-model";
import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { AlertActionsDropdown } from "./AlertActionsDropdown.js";
import { getAlertThreshold, getOperatorTitle, getValueSuffix } from "./utils.js";
import { gdColorNegative } from "../../../../constants/colors.js";
import { useAlertValidation } from "./hooks/useAlertValidation.js";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../../model/index.js";

interface IAlertsListItemProps {
    alert: IAutomationMetadataObject;
    separators?: ISeparators;
    onEditAlert: (alert: IAutomationMetadataObject) => void;
    onPauseAlert: (alert: IAutomationMetadataObject) => void;
    onDeleteAlert: (alert: IAutomationMetadataObject) => void;
    onResumeAlert: (alert: IAutomationMetadataObject) => void;
}

export const AlertsListItem: React.FC<IAlertsListItemProps> = ({
    alert,
    separators,
    onEditAlert,
    onPauseAlert,
    onDeleteAlert,
    onResumeAlert,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const isPaused = alert.alert?.trigger?.state === "PAUSED";
    const description = getDescription(intl, alert, separators);
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

function getDescription(intl: IntlShape, alert: IAutomationMetadataObject, separators?: ISeparators): string {
    const valueSuffix = getValueSuffix(alert.alert) ?? "";
    const title = getOperatorTitle(intl, alert.alert);
    const threshold = getAlertThreshold(alert.alert);
    const convertedValue = ClientFormatterFacade.convertValue(threshold);
    const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, undefined, separators);

    return `${title} ${formattedValue}${valueSuffix}`;
}
