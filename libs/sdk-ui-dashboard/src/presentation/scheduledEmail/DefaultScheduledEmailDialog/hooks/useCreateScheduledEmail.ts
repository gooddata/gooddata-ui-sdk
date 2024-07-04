// (C) 2020-2024 GoodData Corporation
import { useCallback } from "react";
import {
    FilterContextItem,
    IFilterContextDefinition,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import {
    CommandProcessingStatus,
    createScheduledEmail,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";
import { ensureAllTimeFilterForExport } from "../../../../_staging/exportUtils/filterUtils.js";

export const useCreateScheduledEmail = ({
    onBeforeRun,
    onSuccess,
    onError,
}: {
    onBeforeRun?: (
        scheduledEmailToCreate: IAutomationMetadataObjectDefinition,
        filters?: FilterContextItem[],
    ) => void;
    onSuccess?: (scheduledEmail: IAutomationMetadataObject) => void;
    onError?: (error: any) => void;
} = {}): {
    create: (
        scheduledEmailToCreate: IAutomationMetadataObjectDefinition,
        filters?: FilterContextItem[],
    ) => void;
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
        (scheduledEmailToCreate: IAutomationMetadataObjectDefinition, filters?: FilterContextItem[]) => {
            const filterContext: IFilterContextDefinition | undefined = filters && {
                title: "filterContext",
                description: "",
                filters: ensureAllTimeFilterForExport(filters),
            };

            scheduledEmailCommandProcessing.run(scheduledEmailToCreate, filterContext);
        },
        [scheduledEmailCommandProcessing],
    );

    return {
        create,
        creationStatus: scheduledEmailCommandProcessing.status,
    };
};
