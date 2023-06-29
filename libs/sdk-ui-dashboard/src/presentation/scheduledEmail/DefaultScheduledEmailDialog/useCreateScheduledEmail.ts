// (C) 2020-2022 GoodData Corporation
import { useCallback } from "react";
import {
    FilterContextItem,
    IFilterContextDefinition,
    IScheduledMail,
    IScheduledMailDefinition,
} from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    createScheduledEmail,
    useDashboardCommandProcessing,
} from "../../../model/index.js";
import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";

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
                filters: ensureAllTimeFilterForExport(filters),
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
