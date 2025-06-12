// (C) 2019-2025 GoodData Corporation
import { useCallback, useState } from "react";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    isExportDefinitionVisualizationObjectRequestPayload,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
    isAllTimeDateFilter,
    isExportDefinitionDashboardRequestPayload,
    isAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { useCreateScheduledEmail } from "./useCreateScheduledEmail.js";
import { useUpdateScheduledEmail } from "./useUpdateScheduledEmail.js";
import { IScheduledEmailDialogProps } from "../../types.js";
import { IntlShape, useIntl } from "react-intl";
import omit from "lodash/omit.js";
import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../../model/index.js";

export function useSaveScheduledEmailToBackend(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    {
        onSuccess,
        onError,
        onSubmit,
        onSaveSuccess,
        onSaveError,
        onSave,
    }: Pick<
        IScheduledEmailDialogProps,
        "onSuccess" | "onError" | "onSubmit" | "onSaveSuccess" | "onSaveError" | "onSave"
    >,
) {
    const intl = useIntl();
    const enableAutomationFilterContext = useDashboardSelector(selectEnableAutomationFilterContext);
    const [savingErrorMessage, setSavingErrorMessage] = useState<string | undefined>(undefined);
    const scheduledEmailCreator = useCreateScheduledEmail({
        onSuccess: (scheduledEmail: IAutomationMetadataObject) => {
            onSuccess?.(scheduledEmail);
        },
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
        (scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAutomation = sanitizeAutomation(
                scheduledEmail,
                intl,
                enableAutomationFilterContext,
            );
            scheduledEmailCreator.create(sanitizedAutomation as IAutomationMetadataObjectDefinition);
        },
        [scheduledEmailCreator, enableAutomationFilterContext, intl],
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
        (scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAutomation = sanitizeAutomation(
                scheduledEmail,
                intl,
                enableAutomationFilterContext,
            );
            scheduledEmailUpdater.save(sanitizedAutomation as IAutomationMetadataObject);
        },
        [scheduledEmailUpdater, enableAutomationFilterContext, intl],
    );

    const handleSaveScheduledEmail = (): void => {
        const sanitizedAutomation = sanitizeAutomation(automation, intl, enableAutomationFilterContext);

        if (sanitizedAutomation.id) {
            handleUpdateScheduledEmail(sanitizedAutomation);
        } else {
            handleCreateScheduledEmail(sanitizedAutomation);
        }
    };

    const isSavingScheduledEmail =
        scheduledEmailCreator.creationStatus === "running" ||
        scheduledEmailUpdater.savingStatus === "running";

    return { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage };
}

function sanitizeAutomation(
    automationToSave: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    intl: IntlShape,
    enableAutomationFilterContext: boolean,
) {
    const automation = {
        ...automationToSave,
    };

    if (!automation.title) {
        automation.title = intl.formatMessage({ id: "dialogs.schedule.email.title.placeholder" });
    }

    // We want to omit the cronDescription as it is a variable created on backend that cannot
    // be overriden and BE has hard time handling it with each PUT
    if (automation.schedule) {
        automation.schedule = omit(automation.schedule, ["cronDescription"]);
    }

    /**
     * Remove all-time date filters from export definitions.
     * They are not required for the execution and not event valid as AFM date granularity.
     * They are added ad-hoc to be visible in the UI in useAutomationFiltersSelect hook,
     * depending on whether they are ignored or not.
     */
    if (automation.exportDefinitions && !enableAutomationFilterContext) {
        automation.exportDefinitions = removeAllTimeDateFiltersFromExportDefinitions(
            automation.exportDefinitions,
        );
    }

    return automation;
}

function removeAllTimeDateFiltersFromExportDefinitions(
    exportDefinitions: (IExportDefinitionMetadataObject | IExportDefinitionMetadataObjectDefinition)[],
) {
    return exportDefinitions.map((exportDefinition) => {
        if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
            return {
                ...exportDefinition,
                requestPayload: {
                    ...exportDefinition.requestPayload,
                    content: {
                        ...exportDefinition.requestPayload.content,
                        filters: exportDefinition.requestPayload.content.filters?.filter(
                            (f) => !isAllTimeDateFilter(f),
                        ),
                    },
                },
            };
        } else if (isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload)) {
            return {
                ...exportDefinition,
                requestPayload: {
                    ...exportDefinition.requestPayload,
                    content: {
                        ...exportDefinition.requestPayload.content,
                        filters: exportDefinition.requestPayload.content.filters?.filter(
                            (f) => !isAllTimeDashboardDateFilter(f),
                        ),
                    },
                },
            };
        }
        return exportDefinition;
    });
}
