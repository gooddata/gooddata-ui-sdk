// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { IScheduledMailDefinition } from "@gooddata/sdk-backend-spi";
import { CommandProcessingStatus, saveScheduledEmail, useDashboardCommandProcessing } from "../../../model";

export const useSaveScheduledEmail = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (scheduledEmailToSave: IScheduledMailDefinition) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
} = {}): {
    save: (scheduledEmailToSave: IScheduledMailDefinition) => void;
    savingStatus?: CommandProcessingStatus;
} => {
    const scheduledEmailCommandProcessing = useDashboardCommandProcessing({
        commandCreator: saveScheduledEmail,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
        onError: (event) => {
            onError?.(event.payload.error);
        },
        onSuccess: () => {
            onSuccess?.();
        },
        onBeforeRun: (cmd) => {
            onBeforeRun?.(cmd.payload.scheduledEmail);
        },
    });

    const save = useCallback((scheduledEmailToSave: IScheduledMailDefinition) => {
        scheduledEmailCommandProcessing.run(scheduledEmailToSave);
    }, []);

    return {
        save,
        savingStatus: scheduledEmailCommandProcessing.status,
    };
};
