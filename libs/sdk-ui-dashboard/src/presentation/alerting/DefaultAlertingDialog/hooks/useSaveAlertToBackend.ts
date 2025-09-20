// (C) 2019-2025 GoodData Corporation
import { useCallback } from "react";

import { omit } from "lodash-es";

import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IFilter,
    isAllTimeDateFilter,
} from "@gooddata/sdk-model";

import { useCreateAlert } from "./useCreateAlert.js";
import { useUpdateAlert } from "./useUpdateAlert.js";
import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../../model/index.js";

/**
 * @internal
 * @param onCreateSuccess - callback to be called when alert is created successfully
 * @param onCreateError - callback to be called when alert creation fails
 * @param onUpdateSuccess - callback to be called when alert is updated successfully
 * @param onUpdateError - callback to be called when alert update fails
 * @param onPauseSuccess - callback to be called when alert is paused successfully
 * @param onPauseError - callback to be called when alert pausing fails
 * @param onResumeSuccess - callback to be called when alert is resumed successfully
 * @param onResumeError - callback to be called when alert resuming fails
 */
export function useSaveAlertToBackend({
    onCreateSuccess,
    onCreateError,
    onUpdateSuccess,
    onUpdateError,
    onPauseSuccess,
    onPauseError,
    onResumeSuccess,
    onResumeError,
}: {
    onCreateSuccess?: (alert: IAutomationMetadataObject) => void;
    onCreateError?: (error: Error) => void;
    onUpdateSuccess?: (alert: IAutomationMetadataObject) => void;
    onUpdateError?: (error: Error) => void;
    onPauseSuccess?: (alert: IAutomationMetadataObject) => void;
    onPauseError?: (error: Error) => void;
    onResumeSuccess?: (alert: IAutomationMetadataObject) => void;
    onResumeError?: (error: Error) => void;
}) {
    const enableAutomationFilterContext = useDashboardSelector(selectEnableAutomationFilterContext);
    const alertCreator = useCreateAlert({
        onSuccess: (alert: IAutomationMetadataObject) => onCreateSuccess?.(alert),
        onError: onCreateError,
    });

    const handleCreateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAlert = sanitizeAutomation(
                alert as IAutomationMetadataObject,
                enableAutomationFilterContext,
            );
            alertCreator.create(sanitizedAlert);
        },
        [alertCreator, enableAutomationFilterContext],
    );

    const alertUpdater = useUpdateAlert({
        onSuccess: onUpdateSuccess,
        onError: onUpdateError,
    });

    const handleUpdateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAlert = sanitizeAutomation(
                alert as IAutomationMetadataObject,
                enableAutomationFilterContext,
            );
            alertUpdater.save(sanitizedAlert);
        },
        [alertUpdater, enableAutomationFilterContext],
    );

    const alertPauser = useUpdateAlert({
        onSuccess: onPauseSuccess,
        onError: onPauseError,
    });

    const handlePauseAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertPauser.save(
                sanitizeAutomation(alert as IAutomationMetadataObject, enableAutomationFilterContext),
            );
        },
        [alertPauser, enableAutomationFilterContext],
    );

    const alertResumer = useUpdateAlert({
        onSuccess: onResumeSuccess,
        onError: onResumeError,
    });

    const handleResumeAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertResumer.save(
                sanitizeAutomation(alert as IAutomationMetadataObject, enableAutomationFilterContext),
            );
        },
        [alertResumer, enableAutomationFilterContext],
    );

    const isSavingAlert =
        alertCreator.creationStatus === "running" ||
        alertUpdater.savingStatus === "running" ||
        alertPauser.savingStatus === "running" ||
        alertResumer.savingStatus === "running";

    return { handleCreateAlert, handleUpdateAlert, handlePauseAlert, handleResumeAlert, isSavingAlert };
}

function sanitizeAutomation(
    automationToSave: IAutomationMetadataObject,
    enableAutomationFilterContext: boolean,
): IAutomationMetadataObject {
    let automation = {
        ...automationToSave,
    };
    // We want to omit the cronDescription as it is a variable created on backend that cannot
    // be overriden and BE has hard time handling it with each PUT
    if (automation.schedule) {
        automation.schedule = omit(automation.schedule, ["cronDescription"]);
    }

    if (automation.alert?.execution?.filters) {
        automation = {
            ...automation,
            alert: {
                ...automation.alert,
                execution: {
                    ...automation.alert.execution,
                    filters: enableAutomationFilterContext
                        ? automation.alert.execution.filters
                        : removeAllTimeDateFiltersFromAlertFilters(automation.alert.execution.filters),
                },
            },
        };
    }

    return automation;
}

function removeAllTimeDateFiltersFromAlertFilters(filters: IFilter[]) {
    return filters.filter((filter) => !isAllTimeDateFilter(filter));
}
