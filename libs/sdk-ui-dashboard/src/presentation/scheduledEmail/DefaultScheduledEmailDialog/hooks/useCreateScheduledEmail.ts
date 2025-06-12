// (C) 2020-2024 GoodData Corporation
import { useCallback } from "react";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    createScheduledEmail,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";

export const useCreateScheduledEmail = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (scheduledEmailToCreate: IAutomationMetadataObjectDefinition) => void;
    onSuccess?: (scheduledEmail: IAutomationMetadataObject) => void;
    onError?: (error: any) => void;
} = {}): {
    create: (scheduledEmailToCreate: IAutomationMetadataObjectDefinition) => void;
    creationStatus?: CommandProcessingStatus;
} => {
    const scheduledEmailCommandProcessing = useDashboardCommandProcessing({
        commandCreator: createScheduledEmail,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
        onError: (event) => {
            onError?.(event.payload.error);
        },
        onSuccess: (event) => {
            onSuccess?.(event.payload.scheduledEmail);
        },
        onBeforeRun: (cmd) => {
            onBeforeRun?.(cmd.payload.scheduledEmail);
        },
    });

    const create = useCallback(
        (scheduledEmailToCreate: IAutomationMetadataObjectDefinition) => {
            scheduledEmailCommandProcessing.run(scheduledEmailToCreate);
        },
        [scheduledEmailCommandProcessing],
    );

    return {
        create,
        creationStatus: scheduledEmailCommandProcessing.status,
    };
};
