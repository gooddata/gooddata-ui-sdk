// (C) 2019-2026 GoodData Corporation

import { useCallback } from "react";

import { omit } from "lodash-es";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IFilter,
    isAllValuesAttributeFilter,
} from "@gooddata/sdk-model";

import { useCreateAlert } from "./useCreateAlert.js";
import { useUpdateAlert } from "./useUpdateAlert.js";

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
    const alertCreator = useCreateAlert({
        onSuccess: (alert: IAutomationMetadataObject) => onCreateSuccess?.(alert),
        onError: onCreateError,
    });

    const handleCreateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAlert = sanitizeAutomation(alert as IAutomationMetadataObject);
            alertCreator.create(sanitizedAlert);
        },
        [alertCreator],
    );

    const alertUpdater = useUpdateAlert({
        onSuccess: onUpdateSuccess,
        onError: onUpdateError,
    });

    const handleUpdateAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            const sanitizedAlert = sanitizeAutomation(alert as IAutomationMetadataObject);
            alertUpdater.save(sanitizedAlert);
        },
        [alertUpdater],
    );

    const alertPauser = useUpdateAlert({
        onSuccess: onPauseSuccess,
        onError: onPauseError,
    });

    const handlePauseAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertPauser.save(sanitizeAutomation(alert as IAutomationMetadataObject));
        },
        [alertPauser],
    );

    const alertResumer = useUpdateAlert({
        onSuccess: onResumeSuccess,
        onError: onResumeError,
    });

    const handleResumeAlert = useCallback(
        (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            alertResumer.save(sanitizeAutomation(alert as IAutomationMetadataObject));
        },
        [alertResumer],
    );

    const isSavingAlert =
        alertCreator.creationStatus === "running" ||
        alertUpdater.savingStatus === "running" ||
        alertPauser.savingStatus === "running" ||
        alertResumer.savingStatus === "running";

    return { handleCreateAlert, handleUpdateAlert, handlePauseAlert, handleResumeAlert, isSavingAlert };
}

function sanitizeAutomation(automationToSave: IAutomationMetadataObject): IAutomationMetadataObject {
    let automation = {
        ...automationToSave,
    };
    // cronDescription is a variable created on backend that cannot be overridden and BE has hard time
    // handling it with each PUT
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
                    filters: removeNoopFiltersFromAlertFilters(automation.alert.execution.filters),
                },
            },
        };
    }

    return automation;
}

function removeNoopFiltersFromAlertFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((filter) => !isAllValuesAttributeFilter(filter));
}
