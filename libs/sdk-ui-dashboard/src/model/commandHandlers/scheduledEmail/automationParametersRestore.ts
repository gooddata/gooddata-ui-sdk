// (C) 2026 GoodData Corporation

import { type IDashboardExportParameter, type IInsightParameterValue } from "@gooddata/sdk-model";

import { exportParametersToValues } from "../../../_staging/automation/index.js";
import { type ChangeParameterValuesParams } from "../../commands/parameters.js";

/**
 * Pure decision logic for restoring an automation's stored parameter overrides on dashboard load.
 * Returns the {@link changeParameterValues} command params to dispatch: alert params target the
 * active tab, export params target their own tab. Mirrors the filter-side `extractRelevantFilters` —
 * the saga reads the raw pieces off the automation and dispatches each result.
 *
 * @internal
 */
export function extractAutomationParameterChanges(
    enableParameters: boolean,
    alertParameters: IInsightParameterValue[] | undefined,
    exportParametersByTab: Record<string, IDashboardExportParameter[]> | undefined,
    correlationId: string,
): ChangeParameterValuesParams[] {
    if (!enableParameters) {
        return [];
    }
    const changes: ChangeParameterValuesParams[] = [];
    if (alertParameters?.length) {
        changes.push({ parameters: alertParameters, correlationId });
    }
    for (const [tabLocalIdentifier, exportParameters] of Object.entries(exportParametersByTab ?? {})) {
        const parameters = exportParametersToValues(exportParameters);
        if (parameters.length) {
            changes.push({ parameters, tabLocalIdentifier, correlationId });
        }
    }
    return changes;
}
