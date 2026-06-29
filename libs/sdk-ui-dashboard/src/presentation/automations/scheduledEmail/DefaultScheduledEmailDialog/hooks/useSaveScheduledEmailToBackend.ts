// (C) 2019-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { omit } from "lodash-es";
import { type IntlShape, useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IExportDefinitionMetadataObject,
    type IExportDefinitionMetadataObjectDefinition,
    isAllValuesAttributeFilter,
    isAllValuesDashboardAttributeFilter,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { type IScheduledEmailDialogProps } from "../../types.js";

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
    const [savingErrorMessage, setSavingErrorMessage] = useState<string | undefined>(undefined);
    const [isSavingScheduledEmail, setIsSavingScheduledEmail] = useState(false);

    const { createScheduledEmail, saveScheduledEmail } = useScheduledEmailDialogContext();

    const handleCreateScheduledEmail = useCallback(
        async (scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAutomation = sanitizeAutomation(
                scheduledEmail,
                intl,
            ) as IAutomationMetadataObjectDefinition;
            setSavingErrorMessage(undefined);
            onSubmit?.(sanitizedAutomation);
            setIsSavingScheduledEmail(true);
            try {
                const created = await createScheduledEmail(sanitizedAutomation);
                onSuccess?.(created);
            } catch (error: any) {
                /**
                 * Handle 400 error separately as it contains a detailed error message
                 * to be shown in the dialog without closing it
                 */
                if (error?.cause?.response?.status === 400) {
                    setSavingErrorMessage(error.cause.response.data?.detail);
                } else {
                    onError?.(error as GoodDataSdkError);
                }
            } finally {
                setIsSavingScheduledEmail(false);
            }
        },
        [createScheduledEmail, intl, onSubmit, onSuccess, onError],
    );

    const handleUpdateScheduledEmail = useCallback(
        async (scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAutomation = sanitizeAutomation(scheduledEmail, intl) as IAutomationMetadataObject;
            setSavingErrorMessage(undefined);
            onSave?.(sanitizedAutomation);
            setIsSavingScheduledEmail(true);
            try {
                await saveScheduledEmail(sanitizedAutomation);
                onSaveSuccess?.();
            } catch (error: any) {
                /**
                 * Handle 400 error separately as it contains a detailed error message
                 * to be shown in the dialog without closing it
                 */
                if (error?.cause?.response?.status === 400) {
                    setSavingErrorMessage(error.cause.response.data?.detail);
                } else {
                    onSaveError?.(error as GoodDataSdkError);
                }
            } finally {
                setIsSavingScheduledEmail(false);
            }
        },
        [saveScheduledEmail, intl, onSave, onSaveSuccess, onSaveError],
    );

    const handleSaveScheduledEmail = useCallback((): void => {
        if (automation.id) {
            void handleUpdateScheduledEmail(automation);
        } else {
            void handleCreateScheduledEmail(automation);
        }
    }, [automation, handleUpdateScheduledEmail, handleCreateScheduledEmail]);

    return { handleSaveScheduledEmail, isSavingScheduledEmail, savingErrorMessage };
}

function sanitizeAutomation(
    automationToSave: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    intl: IntlShape,
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
     * Remove noop filters from export definitions before saving to backend.
     * - "All time" date filters are not required for the execution and not even valid as AFM date granularity.
     *   They are added ad-hoc to be visible in the UI in useAutomationFiltersSelect hook,
     *   depending on whether they are ignored or not.
     * - "All values" attribute filters have no effect on execution and should not appear in notifications.
     */
    if (automation.exportDefinitions) {
        automation.exportDefinitions = removeNoopFiltersFromExportDefinitions(automation.exportDefinitions);
    }

    return automation;
}

function removeNoopFiltersFromExportDefinitions<
    T extends IExportDefinitionMetadataObject | IExportDefinitionMetadataObjectDefinition,
>(exportDefinitions: T[]): T[] {
    return exportDefinitions.map((exportDefinition) => {
        if (isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload)) {
            const filters = exportDefinition.requestPayload.content.filters;
            return {
                ...exportDefinition,
                requestPayload: {
                    ...exportDefinition.requestPayload,
                    content: {
                        ...exportDefinition.requestPayload.content,
                        filters: filters?.filter((filter) => {
                            // Strip noop "All values" attribute filters (handles both IFilter and FilterContextItem formats).
                            return (
                                !isAllValuesAttributeFilter(filter) &&
                                !isAllValuesDashboardAttributeFilter(filter)
                            );
                        }),
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
                        filters: exportDefinition.requestPayload.content.filters?.filter((filter) => {
                            // Strip noop "All values" attribute filters.
                            return !isAllValuesDashboardAttributeFilter(filter);
                        }),
                    },
                },
            };
        }
        return exportDefinition;
    });
}
