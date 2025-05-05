// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { gdColorNegative } from "../../../../constants/colors.js";

import { useAlertValidation } from "../../../../alerting/DefaultAlertingDialog/hooks/useAlertValidation.js";
import { AlertActionsDropdown } from "../../../../alerting/DefaultAlertingDialog/components/AlertActionsDropdown.js";

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
    const isPaused = alert.alert?.trigger?.state === "PAUSED";
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
                    <BubbleHoverTrigger tagName="div" showDelay={500} hideDelay={0}>
                        <div className="gd-alerts-list-item__title">{alert.title}</div>
                        <Bubble
                            className="bubble-primary"
                            alignPoints={[{ align: "bc tc" }]}
                            arrowOffsets={{ "bc tc": [10, 0] }}
                        >
                            {alert.title}
                        </Bubble>
                    </BubbleHoverTrigger>
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
