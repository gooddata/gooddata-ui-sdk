// (C) 2020-2025 GoodData Corporation
import { useCallback } from "react";

import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";

import {
    CommandProcessingStatus,
    createAlert,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";

export const useCreateAlert = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (alertToCreate: IAutomationMetadataObjectDefinition) => void;
    onSuccess?: (alert: IAutomationMetadataObject) => void;
    onError?: (error: any) => void;
} = {}): {
    create: (alertToCreate: IAutomationMetadataObjectDefinition) => void;
    creationStatus?: CommandProcessingStatus;
} => {
    const alertCommandProcessing = useDashboardCommandProcessing({
        commandCreator: createAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.CREATED",
        onError: (event) => {
            onError?.(event.payload.error);
        },
        onSuccess: (event) => {
            onSuccess?.(event.payload.alert);
        },
        onBeforeRun: (cmd) => {
            onBeforeRun?.(cmd.payload.alert);
        },
    });

    const create = useCallback(
        (alertToCreate: IAutomationMetadataObjectDefinition) => {
            alertCommandProcessing.run(alertToCreate);
        },
        [alertCommandProcessing],
    );

    return {
        create,
        creationStatus: alertCommandProcessing.status,
    };
};
