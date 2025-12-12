// (C) 2022-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IInsightWidget,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import { Button, Dialog, Hyperlink, Typography, useId } from "@gooddata/sdk-ui-kit";

import { AlertsOld } from "./components/AlertsListOld.js";
import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { messages } from "../../../locales.js";
import { selectIsWhiteLabeled, useDashboardSelector } from "../../../model/index.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { type IAlertingManagementDialogOldProps } from "../types.js";

/**
 * @alpha
 */
export function DefaultAlertingManagementDialogOld({
    onPauseSuccess,
    onPauseError,
    onEdit,
    onDeleteSuccess,
    onDeleteError,
    onClose,
    isLoadingAlertingData,
    automations,
}: IAlertingManagementDialogOldProps) {
    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);
    const [alertToPause, setAlertToPause] = useState<[IAutomationMetadataObject, boolean] | null>(null);
    const intl = useIntl();
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const handleAlertDelete = useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const handleAlertEdit = useCallback(
        (
            alert: IAutomationMetadataObject,
            widget: IInsightWidget | undefined,
            anchor: HTMLElement | null,
            onClosed: () => void,
        ) => {
            onEdit?.(alert, widget, anchor, onClosed);
        },
        [onEdit],
    );

    const handleAlertPause = useCallback((alert: IAutomationMetadataObject, pause: boolean) => {
        setAlertToPause([alert, pause]);
    }, []);

    const handleAlertDeleteSuccess = (
        alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    ) => {
        onDeleteSuccess?.(alert as IAutomationMetadataObject);
        setAlertToDelete(null);
    };

    const handleAlertPauseSuccess = (
        alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
        pause: boolean,
    ) => {
        onPauseSuccess?.(alert as IAutomationMetadataObject, pause);
        setAlertToPause(null);
    };

    const handleAlertPauseError = (err: GoodDataSdkError, pause: boolean) => {
        onPauseError?.(err, pause);
        setAlertToPause(null);
    };

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    const titleElementId = useId();

    return (
        <>
            <Dialog
                displayCloseButton
                onCancel={onClose}
                shouldCloseOnClick={() => false}
                className="gd-notifications-channels-management-dialog s-alerting-management-dialog"
                accessibilityConfig={{ titleElementId, isModal: true }}
            >
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header" id={titleElementId}>
                        <FormattedMessage id="dialogs.alerting.management.title" />
                    </Typography>
                </div>
                <div className="gd-notifications-channels-content">
                    <div className="gd-notifications-channels-content-header">
                        <Typography tagName="h3">
                            <FormattedMessage id={messages.alertingManagementListTitle.id!} />
                        </Typography>
                    </div>
                    <AlertsOld
                        onDelete={handleAlertDelete}
                        onEdit={handleAlertEdit}
                        onPause={handleAlertPause}
                        isLoading={isLoadingAlertingData}
                        alerts={automations}
                        noAlertsMessageId={messages.alertingManagementNoAlerts.id!}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                            iconClass="gd-icon-circle-question"
                        />
                    )}
                    <Button
                        onClick={onClose}
                        className="gd-button-secondary s-close-button"
                        value={intl.formatMessage({ id: "close" })}
                    />
                </div>
            </Dialog>
            {alertToDelete ? (
                <DeleteAlertConfirmDialog
                    alert={alertToDelete}
                    onCancel={() => setAlertToDelete(null)}
                    onSuccess={handleAlertDeleteSuccess}
                    onError={onDeleteError}
                />
            ) : null}
            {alertToPause ? (
                <PauseAlertRunner
                    alert={alertToPause[0]}
                    pause={alertToPause[1]}
                    onSuccess={handleAlertPauseSuccess}
                    onError={handleAlertPauseError}
                />
            ) : null}
        </>
    );
}
