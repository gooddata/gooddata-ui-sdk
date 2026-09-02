// (C) 2026 GoodData Corporation

import {
    type IDashboardExportParameter,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    isStringParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import { decodeParameterWireValue, exportParametersToValues } from "../../../_staging/automation/index.js";
import { type ChangeParameterValuesParams } from "../../commands/parameters.js";
import { buildWorkspaceParametersByRef } from "../../store/tabs/parameters/parametersHelpers.js";

/**
 * Pure decision logic for restoring an automation's stored parameter overrides on dashboard load.
 * Returns the {@link changeParameterValues} command params to dispatch: alert params target the
 * active tab, export params target their own tab. Each export wire row carries its own type tag;
 * alert rows are untyped, so they decode against the workspace catalog definition and rows whose
 * ref left the catalog or whose value does not decode are skipped — but only when the catalog
 * actually loaded (`catalogIsLoaded`): decoding against a failed/empty catalog would silently
 * drop every override, so the alert restore is skipped instead (export rows carry their own tags
 * and need no catalog). Mirrors the filter-side `extractRelevantFilters` — the saga reads the raw
 * pieces off the automation and dispatches each result.
 *
 * @internal
 */
export function extractAutomationParameterChanges({
    enableParameters,
    enableStringParameters,
    alertParameters,
    exportParametersByTab,
    catalog,
    catalogIsLoaded,
    correlationId,
}: {
    enableParameters: boolean;
    enableStringParameters: boolean;
    alertParameters: IInsightParameterValue[] | undefined;
    exportParametersByTab: Record<string, IDashboardExportParameter[]> | undefined;
    catalog: IParameterMetadataObject[];
    catalogIsLoaded: boolean;
    correlationId: string;
}): ChangeParameterValuesParams[] {
    if (!enableParameters) {
        return [];
    }
    const changes: ChangeParameterValuesParams[] = [];
    if (catalogIsLoaded && alertParameters?.length) {
        const catalogByRef = buildWorkspaceParametersByRef(catalog);
        const parameters = alertParameters.flatMap((row) => {
            const definition = catalogByRef.get(objRefToString(row.ref))?.definition;
            if (!definition || (isStringParameterDefinition(definition) && !enableStringParameters)) {
                return [];
            }
            const value = decodeParameterWireValue(definition, row.value);
            return value === undefined ? [] : { ref: row.ref, value };
        });
        if (parameters.length) {
            changes.push({ parameters, correlationId });
        }
    }
    for (const [tabLocalIdentifier, exportParameters] of Object.entries(exportParametersByTab ?? {})) {
        const parameters = exportParametersToValues(exportParameters, enableStringParameters);
        if (parameters.length) {
            changes.push({ parameters, tabLocalIdentifier, correlationId });
        }
    }
    return changes;
}
