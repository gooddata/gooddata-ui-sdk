// (C) 2022-2024 GoodData Corporation

import React, { useCallback, useState } from "react";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";

import { IAlertingManagementDialogProps } from "../types.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { messages } from "../../../locales.js";
import { Alerts } from "./components/AlertsList.js";
import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export const AlertingManagementDialog: React.FC<IAlertingManagementDialogProps> = (props) => {
    const {
        onPauseSuccess,
        onPauseError,
        onEdit,
        onDeleteSuccess,
        onDeleteError,
        onClose,
        isLoadingAlertingData,
        automations,
        webhooks,
    } = props;
    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);
    const [alertToPause, setAlertToPause] = useState<[IAutomationMetadataObject, boolean] | null>(null);
    const intl = useIntl();

    const handleAlertDelete = useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const handleAlertEdit = useCallback(
        (alert: IAutomationMetadataObject) => {
            onEdit?.(alert);
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

    return (
        <>
            <Dialog
                displayCloseButton={true}
                onCancel={onClose}
                shouldCloseOnClick={() => false}
                className="gd-scheduled-email-management-dialog s-alerting-management-dialog"
            >
                <div className="gd-scheduled-email-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header">
                        <FormattedMessage id="dialogs.alerting.management.title" />
                    </Typography>
                </div>
                <div className="gd-scheduled-emails-content">
                    <div className="gd-scheduled-emails-content-header">
                        <Typography tagName="h3">
                            <FormattedMessage id={messages.alertingManagementListTitle.id!} />
                        </Typography>
                    </div>
                    <Alerts
                        onDelete={handleAlertDelete}
                        onEdit={handleAlertEdit}
                        onPause={handleAlertPause}
                        isLoading={isLoadingAlertingData}
                        alerts={automations}
                        noAlertsMessageId={messages.alertingManagementNoAlerts.id!}
                        webhooks={webhooks}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    <Hyperlink
                        text={intl.formatMessage({ id: helpTextId })}
                        href="https://www.gooddata.com/docs/cloud/create-dashboards/export/schedule-emailing/"
                        iconClass="gd-icon-circle-question"
                    />
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
};
