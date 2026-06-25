// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { useAlertingManagementDialogContext } from "../../../contexts/AlertingManagementDialogContext.js";

interface IPauseAlertRunnerProps {
    alert: IAutomationMetadataObject | null;
    pause: boolean;
    onSuccess?: (
        alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
        pause: boolean,
    ) => void;
    onError?: (error: GoodDataSdkError, pause: boolean) => void;
}

export function PauseAlertRunner({ alert, pause, onSuccess, onError }: IPauseAlertRunnerProps) {
    const { pauseAlert, resumeAlert } = useAlertingManagementDialogContext();

    useEffect(() => {
        if (!alert) {
            return;
        }

        if (pause) {
            const alertToPause = {
                ...alert,
                alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "PAUSED" } },
            } as IAutomationMetadataObject;
            pauseAlert(alertToPause)
                .then((updatedAlert) => onSuccess?.(updatedAlert, true))
                .catch((err) => onError?.(convertError(err), true));
        } else {
            const alertToResume = {
                ...alert,
                alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "ACTIVE" } },
            } as IAutomationMetadataObject;
            resumeAlert(alertToResume)
                .then((updatedAlert) => onSuccess?.(updatedAlert, false))
                .catch((err) => onError?.(convertError(err), false));
        }
    }, [alert, onError, onSuccess, pause, pauseAlert, resumeAlert]);

    return null;
}
