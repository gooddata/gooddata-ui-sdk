// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import {
    IScheduledMailDefinition,
    FilterContextItem,
    IScheduledMail,
    IFilterContextDefinition,
} from "@gooddata/sdk-backend-spi";
import { createScheduledEmail } from "../../model";
import { useDashboardCommandProcessing, CommandProcessingStatus } from "../../dashboardAux";

export const useCreateScheduledEmail = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (scheduledEmailToCreate: IScheduledMailDefinition, filters?: FilterContextItem[]) => void;
    onSuccess?: (scheduledEmail: IScheduledMail) => void;
    onError?: (error: any) => void;
} = {}): {
    create: (scheduledEmailToCreate: IScheduledMailDefinition, filters?: FilterContextItem[]) => void;
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
            onBeforeRun?.(cmd.payload.scheduledEmail, cmd.payload.filterContext?.filters);
        },
    });

    const create = useCallback(
        (scheduledEmailToCreate: IScheduledMailDefinition, filters?: FilterContextItem[]) => {
            const filterContext: IFilterContextDefinition | undefined = filters && {
                title: "filterContext",
                description: "",
                filters,
            };

            scheduledEmailCommandProcessing.run(scheduledEmailToCreate, filterContext);
        },
        [],
    );

    return {
        create,
        creationStatus: scheduledEmailCommandProcessing.status,
    };
};
