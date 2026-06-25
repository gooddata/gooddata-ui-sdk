// (C) 2022-2026 GoodData Corporation

import { useCallback, useState } from "react";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { type IAlertingManagementDialogProps } from "../types.js";

import { DeleteAlertConfirmDialog } from "./components/DeleteAlertConfirmDialog.js";
import { PauseAlertRunner } from "./components/PauseAlertRunner.js";
import { DefaultAlertingManagementDialogContentBasic } from "./DefaultAlertingManagementDialogContentBasic.js";
import { DefaultAlertingManagementDialogContentEnhanced } from "./DefaultAlertingManagementDialogContentEnhanced.js";

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

    const {
        features: { enableAutomationManagement },
    } = useAutomationsContext();

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

    const handleAlertDeleteSuccess = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            onDeleteSuccess?.(alert as IAutomationMetadataObject);
            handleAlertDeleteClose();
        },
        [onDeleteSuccess, handleAlertDeleteClose],
    );

    const handleAlertPauseSuccess = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition, pause: boolean) => {
            onPauseSuccess?.(alert as IAutomationMetadataObject, pause);
            setAlertToPause(null);
        },
        [onPauseSuccess],
    );

    const handleAlertPauseError = useCallback(
        (err: GoodDataSdkError, pause: boolean) => {
            onPauseError?.(err, pause);
            setAlertToPause(null);
        },
        [onPauseError],
    );

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
