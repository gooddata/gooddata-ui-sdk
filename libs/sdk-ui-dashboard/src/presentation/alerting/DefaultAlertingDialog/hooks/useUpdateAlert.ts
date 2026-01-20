// (C) 2024-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import {
    type CommandProcessingStatus,
    type IDashboardAlertSaved,
    saveAlert,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";

export const useUpdateAlert = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (alertToSave: IAutomationMetadataObject) => void;
    onSuccess?: (alert: IAutomationMetadataObject) => void;
    onError?: (error: any) => void;
} = {}): {
    save: (alertToSave: IAutomationMetadataObject) => void;
    savingStatus?: CommandProcessingStatus;
} => {
    const alertCommandProcessing = useDashboardCommandProcessing({
        commandCreator: saveAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.SAVED",
        onError: (event) => {
            onError?.(event.payload.error);
        },
        onSuccess: (event: IDashboardAlertSaved) => {
            onSuccess?.(event.payload.alert);
        },
        onBeforeRun: (cmd) => {
            onBeforeRun?.(cmd.payload.alert);
        },
    });

    const save = useCallback(
        (alertToSave: IAutomationMetadataObject) => {
            alertCommandProcessing.run(alertToSave);
        },
        [alertCommandProcessing],
    );

    return {
        save,
        savingStatus: alertCommandProcessing.status,
    };
};
