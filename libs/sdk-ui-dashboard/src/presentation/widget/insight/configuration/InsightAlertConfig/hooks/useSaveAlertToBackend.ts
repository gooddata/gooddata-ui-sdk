// (C) 2019-2024 GoodData Corporation
import { useCallback } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useCreateAlert } from "./useCreateAlert.js";
import { useUpdateAlert } from "./useUpdateAlert.js";

/**
 * @internal
 * @param onCreateSuccess - callback to be called when alert is created successfully
 * @param onCreateError - callback to be called when alert creation fails
 * @param onUpdateSuccess - callback to be called when alert is updated successfully
 * @param onUpdateError - callback to be called when alert update fails
 * @param onPauseSuccess - callback to be called when alert is paused successfully
 * @param onPauseError - callback to be called when alert pausing fails
 * @param onResumeSuccess - callback to be called when alert is resumed successfully
 * @param onResumeError - callback to be called when alert resuming fails
 */
export function useSaveAlertToBackend({
    onCreateSuccess,
    onCreateError,
    onUpdateSuccess,
    onUpdateError,
    onPauseSuccess,
    onPauseError,
    onResumeSuccess,
    onResumeError,
}: {
    onCreateSuccess?: (alert: IAutomationMetadataObject) => void;
    onCreateError?: (error: Error) => void;
    onUpdateSuccess?: () => void;
    onUpdateError?: (error: Error) => void;
    onPauseSuccess?: () => void;
    onPauseError?: (error: Error) => void;
    onResumeSuccess?: () => void;
    onResumeError?: (error: Error) => void;
}) {
    const alertCreator = useCreateAlert({
        onSuccess: (alert: IAutomationMetadataObject) => onCreateSuccess?.(alert),
        onError: onCreateError,
    });

    const handleCreateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertCreator.create(alert as IAutomationMetadataObjectDefinition);
        },
        [alertCreator],
    );

    const alertUpdater = useUpdateAlert({
        onSuccess: onUpdateSuccess,
        onError: onUpdateError,
    });

    const handleUpdateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertUpdater.save(alert as IAutomationMetadataObject);
        },
        [alertUpdater],
    );

    const alertPauser = useUpdateAlert({
        onSuccess: onPauseSuccess,
        onError: onPauseError,
    });

    const handlePauseAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertPauser.save(alert as IAutomationMetadataObject);
        },
        [alertPauser],
    );

    const alertResumer = useUpdateAlert({
        onSuccess: onResumeSuccess,
        onError: onResumeError,
    });

    const handleResumeAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertResumer.save(alert as IAutomationMetadataObject);
        },
        [alertResumer],
    );

    const isSavingAlert =
        alertCreator.creationStatus === "running" ||
        alertUpdater.savingStatus === "running" ||
        alertPauser.savingStatus === "running" ||
        alertResumer.savingStatus === "running";

    return { handleCreateAlert, handleUpdateAlert, handlePauseAlert, handleResumeAlert, isSavingAlert };
}
