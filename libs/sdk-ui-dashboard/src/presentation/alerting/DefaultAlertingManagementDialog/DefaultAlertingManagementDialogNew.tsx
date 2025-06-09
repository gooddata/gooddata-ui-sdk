// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useState } from "react";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import { AutofocusOnMount, Button, Dialog, Hyperlink, Typography, useId } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";

import { IAlertingManagementDialogProps } from "../types.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { messages } from "../../../locales.js";
import { Alerts } from "./components/AlertsList.js";
import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    useDashboardSelector,
    selectIsWhiteLabeled,
    selectIsAlertingDialogOpen,
} from "../../../model/index.js";

/**
 * @alpha
 */
export const DefaultAlertingManagementDialogNew: React.FC<IAlertingManagementDialogProps> = (props) => {
    const {
        onPauseSuccess,
        onPauseError,
        onEdit,
        onDeleteSuccess,
        onDeleteError,
        onClose,
        isLoadingAlertingData,
        automations,
    } = props;
    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);
    const [alertToPause, setAlertToPause] = useState<[IAutomationMetadataObject, boolean] | null>(null);
    const isEditingOpen = useDashboardSelector(selectIsAlertingDialogOpen);

    const intl = useIntl();
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const handleAlertDeleteOpen = useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const handleAlertDeleteClose = useCallback(() => {
        setAlertToDelete(null);
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
        handleAlertDeleteClose();
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

    const autofocusKey = `${alertToDelete},${isEditingOpen},${isLoadingAlertingData}`;

    return (
        <>
            <Dialog
                displayCloseButton={true}
                onCancel={onClose}
                shouldCloseOnClick={() => false}
                className="gd-notifications-channels-management-dialog s-alerting-management-dialog"
                accessibilityConfig={{ titleElementId, isModal: true }}
                returnFocusTo={"default-menu-button-id"}
                returnFocusAfterClose
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
                    <AutofocusOnMount refocusKey={autofocusKey}>
                        <Alerts
                            onDelete={handleAlertDeleteOpen}
                            onEdit={handleAlertEdit}
                            onPause={handleAlertPause}
                            isLoading={isLoadingAlertingData}
                            alerts={automations}
                            noAlertsMessageId={messages.alertingManagementNoAlerts.id!}
                        />
                    </AutofocusOnMount>
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    {!isWhiteLabeled ? (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                            iconClass="gd-icon-circle-question"
                        />
                    ) : null}
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
                    onCancel={handleAlertDeleteClose}
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
