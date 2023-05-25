// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { IScheduledMailDefinition, ObjRef } from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    saveScheduledEmail,
    useDashboardCommandProcessing,
} from "../../../model/index.js";

export const useSaveScheduledEmail = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (scheduledEmailToSave: IScheduledMailDefinition) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
} = {}): {
    save: (scheduledEmailToSave: IScheduledMailDefinition, filterContextRef?: ObjRef) => void;
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

    const save = useCallback((scheduledEmailToSave: IScheduledMailDefinition, filterContextRef?: ObjRef) => {
        scheduledEmailCommandProcessing.run(scheduledEmailToSave, filterContextRef);
    }, []);

    return {
        save,
        savingStatus: scheduledEmailCommandProcessing.status,
    };
};
