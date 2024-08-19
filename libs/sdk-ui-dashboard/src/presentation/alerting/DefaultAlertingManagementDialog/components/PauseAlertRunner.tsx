// (C) 2022-2024 GoodData Corporation

import React, { useCallback, useEffect } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

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

    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const handlerPauseAlert = useCallback(async () => {
        if (!alert) {
            return;
        }
        try {
            await effectiveBackend
                .workspace(effectiveWorkspace)
                .automations()
                .updateAutomation({
                    ...alert,
                    ...(alert.alert
                        ? {
                              alert: {
                                  ...alert.alert,
                                  trigger: {
                                      ...alert.alert?.trigger,
                                      state: pause ? "PAUSED" : "ACTIVE",
                                  },
                              },
                          }
                        : {}),
                });
            onSuccess?.(alert, pause);
        } catch (err) {
            onError?.(err as GoodDataSdkError, pause);
        }
    }, [alert, effectiveBackend, effectiveWorkspace, onError, onSuccess, pause]);

    useEffect(() => {
        void handlerPauseAlert();
    }, [handlerPauseAlert, alert]);

    return null;
};
