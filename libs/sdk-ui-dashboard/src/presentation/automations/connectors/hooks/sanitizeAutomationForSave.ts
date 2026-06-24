// (C) 2026 GoodData Corporation

import { omit } from "lodash-es";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IFilter,
    isAllValuesAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * Normalizes an automation before it is persisted. Drops the backend-derived
 * `schedule.cronDescription` and strips noop (all-values) attribute filters from
 * the alert execution.
 *
 * Shared by the create/edit save path and the management pause/resume path so
 * every `saveAlert` dispatch sanitizes identically — pause/resume must not
 * round-trip payloads that the normal save intentionally removes.
 *
 * @internal
 */
export function sanitizeAutomationForSave(automation: IAutomationMetadataObject): IAutomationMetadataObject;
export function sanitizeAutomationForSave(
    automation: IAutomationMetadataObjectDefinition,
): IAutomationMetadataObjectDefinition;
export function sanitizeAutomationForSave(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
): IAutomationMetadataObject | IAutomationMetadataObjectDefinition {
    let sanitized = { ...automation };

    if (sanitized.schedule) {
        sanitized.schedule = omit(sanitized.schedule, ["cronDescription"]);
    }

    if (sanitized.alert?.execution?.filters) {
        sanitized = {
            ...sanitized,
            alert: {
                ...sanitized.alert,
                execution: {
                    ...sanitized.alert.execution,
                    filters: removeNoopFiltersFromAlertFilters(sanitized.alert.execution.filters),
                },
            },
        };
    }

    return sanitized;
}

function removeNoopFiltersFromAlertFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((filter) => !isAllValuesAttributeFilter(filter));
}
