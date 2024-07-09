// (C) 2019-2024 GoodData Corporation
import { useCallback, useState } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    FilterContextItem,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { useCreateScheduledEmail } from "./useCreateScheduledEmail.js";
import { useUpdateScheduledEmail } from "./useUpdateScheduledEmail.js";
import { IScheduledEmailDialogProps } from "../../types.js";
import { IntlShape, useIntl } from "react-intl";
import omit from "lodash/omit.js";
import { getAutomationDashboardFilters } from "../utils/getAutomationFilters.js";

export function useSaveScheduledEmailToBackend(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    { onSuccess, onError, onSubmit, onSaveSuccess, onSaveError, onSave }: IScheduledEmailDialogProps,
) {
    const intl = useIntl();
    const [savingErrorMessage, setSavingErrorMessage] = useState<string | undefined>(undefined);
    const scheduledEmailCreator = useCreateScheduledEmail({
        onSuccess,
        onError: (error: GoodDataSdkError) => {
            /**
             * Handle 400 error separately as it contains a detailed error message
             * to be shown in the dialog without closing it
             */
            if (error?.cause?.response?.status === 400) {
                setSavingErrorMessage(error.cause.response.data?.detail);
            } else {
                onError?.(error);
            }
        },
        onBeforeRun: (scheduledEmailToCreate: IAutomationMetadataObjectDefinition) => {
            setSavingErrorMessage(undefined);
            onSubmit?.(scheduledEmailToCreate);
        },
    });
    const handleCreateScheduledEmail = useCallback(
        (
            scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
            filters?: FilterContextItem[],
        ) => {
            scheduledEmailCreator.create(scheduledEmail as IAutomationMetadataObjectDefinition, filters);
        },
        [scheduledEmailCreator],
    );

    const scheduledEmailUpdater = useUpdateScheduledEmail({
        onSuccess: onSaveSuccess,
        onError: (error: GoodDataSdkError) => {
            /**
             * Handle 400 error separately as it contains a detailed error message
             * to be shown in the dialog without closing it
             */
            if (error?.cause?.response?.status === 400) {
                setSavingErrorMessage(error.cause.response.data?.detail);
            } else {
                onSaveError?.(error);
            }
        },
        onBeforeRun: (scheduledEmailToSave: IAutomationMetadataObject) => {
            setSavingErrorMessage(undefined);
            onSave?.(scheduledEmailToSave);
        },
    });

    const handleUpdateScheduledEmail = useCallback(
        (
            scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
            filters?: FilterContextItem[],
        ) => {
            scheduledEmailUpdater.save(scheduledEmail as IAutomationMetadataObject, filters);
        },
        [scheduledEmailUpdater],
    );

    const handleSaveScheduledEmail = (): void => {
        const sanitizedAutomation = sanitizeAutomation(automation, intl);

        // Only filters from dashboard export definition are relevant for scheduled email for now
        const filters = getAutomationDashboardFilters(sanitizedAutomation);

        if (sanitizedAutomation.id) {
            handleUpdateScheduledEmail(sanitizedAutomation, filters);
        } else {
            handleCreateScheduledEmail(sanitizedAutomation, filters);
        }
    };

    const isSavingScheduledEmail =
        scheduledEmailCreator.creationStatus === "running" ||
        scheduledEmailUpdater.savingStatus === "running";

    return { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage };
}

function sanitizeAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    intl: IntlShape,
) {
    if (!automation.title) {
        automation.title = intl.formatMessage({ id: "dialogs.schedule.email.title.placeholder" });
    }

    // We want to omit the cronDescription as it is a variable created on backend that cannot
    // be overriden and BE has hard time handling it with each PUT
    if (automation.schedule) {
        automation.schedule = omit(automation.schedule, ["cronDescription"]);
    }

    return automation;
}
