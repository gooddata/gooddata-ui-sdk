// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useEffect } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { convertError, GoodDataSdkError } from "@gooddata/sdk-ui";

import { useSaveAlertToBackend } from "../../DefaultAlertingDialog/hooks/useSaveAlertToBackend.js";

interface IPauseAlertRunnerProps {
    alert: IAutomationMetadataObject | null;
    pause: boolean;
    onSuccess?: (
        alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
        pause: boolean,
    ) => void;
    onError?: (error: GoodDataSdkError, pause: boolean) => void;
}

export const PauseAlertRunner: React.FC<IPauseAlertRunnerProps> = (props) => {
    const { alert, pause, onSuccess, onError } = props;

    const { handlePauseAlert, handleResumeAlert } = useSaveAlertToBackend({
        onPauseSuccess: () => {
            if (alert) {
                onSuccess?.(alert, true);
            }
        },
        onPauseError: (error) => {
            onError?.(convertError(error), true);
        },
        onResumeSuccess: () => {
            if (alert) {
                onSuccess?.(alert, false);
            }
        },
        onResumeError: () => {
            if (alert) {
                onSuccess?.(alert, false);
            }
        },
    });

    const handlerPauseAlert = useCallback(async () => {
        if (!alert) {
            return;
        }

        if (pause) {
            const alertToPause = {
                ...alert,
                alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "PAUSED" } },
            } as IAutomationMetadataObject;
            handlePauseAlert(alertToPause);
        } else {
            const alertToResume = {
                ...alert,
                alert: { ...alert.alert, trigger: { ...alert.alert?.trigger, state: "ACTIVE" } },
            } as IAutomationMetadataObject;
            handleResumeAlert(alertToResume);
        }
    }, [alert, handlePauseAlert, handleResumeAlert, pause]);

    useEffect(() => {
        void handlerPauseAlert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert]);

    return null;
};
