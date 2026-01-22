// (C) 2020-2026 GoodData Corporation

import { useCallback } from "react";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { createAlert } from "../../../../model/commands/alerts.js";
import {
    type CommandProcessingStatus,
    useDashboardCommandProcessing,
} from "../../../../model/react/useDashboardCommandProcessing.js";

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
