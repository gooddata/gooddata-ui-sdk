// (C) 2022-2024 GoodData Corporation

import React, { useCallback, useEffect } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { useSaveAlertToBackend } from "../../../widget/index.js";

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
            onError?.(error as GoodDataSdkError, true);
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
            handlePauseAlert(alert);
        } else {
            handleResumeAlert(alert);
        }
    }, [alert, handlePauseAlert, handleResumeAlert, pause]);

    useEffect(() => {
        void handlerPauseAlert();
    }, [handlerPauseAlert, alert]);

    return null;
};
