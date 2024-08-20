// (C) 2019-2024 GoodData Corporation
import { useCallback } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useCreateAlert } from "./useCreateAlert.js";
import { useUpdateAlert } from "./useUpdateAlert.js";
// import { dispatchAndWaitFor } from "src/model/index.js";

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
    onCreateSuccess: () => void;
    onCreateError: () => void;
    onUpdateSuccess: () => void;
    onUpdateError: () => void;
    onPauseSuccess: () => void;
    onPauseError: () => void;
    onResumeSuccess: () => void;
    onResumeError: () => void;
}) {
    const alertCreator = useCreateAlert({
        onSuccess: onCreateSuccess,
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
