// (C) 2022-2026 GoodData Corporation

import { useCallback, useState } from "react";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, buildAutomationUrl, navigate, useWorkspace } from "@gooddata/sdk-ui";

import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { DefaultAlertingManagementDialogContentBasic } from "./DefaultAlertingManagementDialogContentBasic.js";
import { DefaultAlertingManagementDialogContentEnhanced } from "./DefaultAlertingManagementDialogContentEnhanced.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableAutomationManagement,
    selectExternalRecipient,
    selectIsEmbedded,
} from "../../../model/store/config/configSelectors.js";
import { selectDashboardId } from "../../../model/store/meta/metaSelectors.js";
import { type IAlertingManagementDialogProps } from "../types.js";

/**
 * @alpha
 */
export function DefaultAlertingManagementDialogNew({
    onPauseSuccess,
    onPauseError,
    onEdit,
    onAdd,
    onDeleteSuccess,
    onDeleteError,
    onClose,
    isLoadingAlertingData,
    automations,
}: IAlertingManagementDialogProps) {
    const [alertToDelete, setAlertToDelete] = useState<IAutomationMetadataObject | null>(null);
    const [alertToPause, setAlertToPause] = useState<[IAutomationMetadataObject, boolean] | null>(null);

    const workspace = useWorkspace();
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);

    const handleAlertDeleteOpen = useCallback((alert: IAutomationMetadataObject) => {
        setAlertToDelete(alert);
    }, []);

    const handleAlertDeleteClose = useCallback(() => {
        setAlertToDelete(null);
    }, []);

    const handleAlertEdit = useCallback(
        (alert: IAutomationMetadataObject) => {
            if (enableAutomationManagement && alert.dashboard?.id !== dashboardId) {
                navigate(
                    buildAutomationUrl({
                        workspaceId: workspace,
                        dashboardId: alert.dashboard?.id,
                        automationId: alert.id,
                        isEmbedded,
                        queryParams: externalRecipientOverride
                            ? { recipient: externalRecipientOverride }
                            : undefined,
                    }),
                );
                return;
            }
            onEdit?.(alert);
        },
        [onEdit, enableAutomationManagement, dashboardId, workspace, isEmbedded, externalRecipientOverride],
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

    return (
        <>
            {enableAutomationManagement ? (
                <DefaultAlertingManagementDialogContentEnhanced
                    onAdd={onAdd}
                    onClose={onClose}
                    onEdit={handleAlertEdit}
                />
            ) : (
                <DefaultAlertingManagementDialogContentBasic
                    onClose={onClose}
                    onDelete={handleAlertDeleteOpen}
                    onEdit={handleAlertEdit}
                    onPause={handleAlertPause}
                    isLoadingAlertingData={isLoadingAlertingData}
                    automations={automations}
                />
            )}
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
