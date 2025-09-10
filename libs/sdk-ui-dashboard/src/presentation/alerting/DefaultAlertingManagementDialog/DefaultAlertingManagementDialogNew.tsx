// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError, buildAutomationUrl, navigate, useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { Automations } from "@gooddata/sdk-ui-ext";
import {
    Button,
    ContentDivider,
    Dialog,
    Hyperlink,
    Typography,
    UiAutofocus,
    useId,
} from "@gooddata/sdk-ui-kit";

import { Alerts } from "./components/AlertsList.js";
import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { messages } from "../../../locales.js";
import {
    selectCanCreateAutomation,
    selectDashboardId,
    selectEnableAutomationManagement,
    selectIsAlertingDialogOpen,
    selectIsAlertingManagementDialogContext,
    selectIsWhiteLabeled,
    selectTimezone,
    useAutomationsInvalidateRef,
    useDashboardSelector,
} from "../../../model/index.js";
import { AUTOMATIONS_COLUMN_CONFIG, AUTOMATIONS_MAX_HEIGHT } from "../../../presentation/constants/index.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { IAlertingManagementDialogProps } from "../types.js";

/**
 * @alpha
 */
export function DefaultAlertingManagementDialogNew(props: IAlertingManagementDialogProps) {
    const {
        onPauseSuccess,
        onPauseError,
        onEdit,
        onAdd,
        onDeleteSuccess,
        onDeleteError,
        onClose,
        isLoadingAlertingData,
        automations,
    } = props;
    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);
    const [alertToPause, setAlertToPause] = useState<[IAutomationMetadataObject, boolean] | null>(null);
    const isEditingOpen = useDashboardSelector(selectIsAlertingDialogOpen);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    const intl = useIntl();
    const workspace = useWorkspace();
    const backend = useBackend();
    const timezone = useDashboardSelector(selectTimezone);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const managementDialogContext = useDashboardSelector(selectIsAlertingManagementDialogContext);

    const invalidateItemsRef = useAutomationsInvalidateRef();

    const handleAlertDeleteOpen = useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const handleAlertDeleteClose = useCallback(() => {
        setAlertToDelete(null);
    }, []);

    const handleAlertEdit = useCallback(
        (alert: IAutomationMetadataObject) => {
            if (enableAutomationManagement && alert.dashboard?.id !== dashboardId) {
                navigate(buildAutomationUrl(workspace, alert.dashboard?.id, alert.id));
                return;
            }
            onEdit?.(alert);
        },
        [onEdit, enableAutomationManagement, dashboardId, workspace],
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

    const handleAddAlert = useCallback(() => {
        onAdd?.();
    }, [onAdd]);

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
                className={cx("gd-notifications-channels-management-dialog s-alerting-management-dialog", {
                    "gd-dialog--wide gd-notifications-channels-management-dialog--wide":
                        enableAutomationManagement,
                })}
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
                    {enableAutomationManagement ? (
                        <ContentDivider />
                    ) : (
                        <div className="gd-notifications-channels-content-header">
                            <Typography tagName="h3">
                                <FormattedMessage id={messages.alertingManagementListTitle.id!} />
                            </Typography>
                        </div>
                    )}
                    <UiAutofocus refocusKey={autofocusKey}>
                        {enableAutomationManagement ? (
                            <Automations
                                workspace={workspace}
                                timezone={timezone}
                                backend={backend}
                                scope="workspace"
                                type="alert"
                                maxHeight={AUTOMATIONS_MAX_HEIGHT}
                                isSmall={true}
                                editAutomation={handleAlertEdit}
                                preselectedFilters={{
                                    dashboard: dashboardId ? [dashboardId] : undefined,
                                }}
                                invalidateItemsRef={invalidateItemsRef}
                                selectedColumnDefinitions={AUTOMATIONS_COLUMN_CONFIG}
                            />
                        ) : (
                            <Alerts
                                onDelete={handleAlertDeleteOpen}
                                onEdit={handleAlertEdit}
                                onPause={handleAlertPause}
                                isLoading={isLoadingAlertingData}
                                alerts={automations}
                                noAlertsMessageId={messages.alertingManagementNoAlerts.id!}
                            />
                        )}
                    </UiAutofocus>
                </div>
                <div className="gd-content-divider"></div>
                <div className={`gd-buttons${isWhiteLabeled ? " gd-buttons--end" : ""}`}>
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                            iconClass="gd-icon-circle-question"
                        />
                    )}
                    <div className="gd-buttons">
                        {enableAutomationManagement &&
                        managementDialogContext.widgetRef &&
                        canCreateAutomation ? (
                            <Button
                                onClick={handleAddAlert}
                                className="gd-button-action s-add-alert-button"
                                value={intl.formatMessage({ id: messages.alertingManagementCreate.id! })}
                            />
                        ) : null}
                        <Button
                            onClick={onClose}
                            className="gd-button-secondary s-close-button"
                            value={intl.formatMessage({ id: "close" })}
                        />
                    </div>
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
}
