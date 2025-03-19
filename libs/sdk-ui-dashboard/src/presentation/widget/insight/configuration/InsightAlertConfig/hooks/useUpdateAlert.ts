// (C) 2024 GoodData Corporation

import { useCallback } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    saveAlert,
    useDashboardCommandProcessing,
} from "../../../../../../model/index.js";

export const useUpdateAlert = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (alertToSave: IAutomationMetadataObject) => void;
    onSuccess?: () => void;
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
        onSuccess: () => {
            onSuccess?.();
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
