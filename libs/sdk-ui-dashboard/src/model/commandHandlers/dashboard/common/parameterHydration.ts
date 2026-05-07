// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type IParameterMetadataObject,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import { type IDashboardParameterEntry } from "../../../store/parameters/parametersState.js";

/**
 * Builds the parameter slice entries from the dashboard's persisted parameters and the
 * workspace parameter catalog.
 *
 * - When the persisted entry has an explicit `value`, use it as `runtimeOverride`.
 * - Otherwise, look up the workspace default.
 * - When neither is available (catalog gated off / failed / ref missing), `runtimeOverride`
 *   stays `undefined` so the backend keeps using the parameter's own default at execution time.
 */
export function hydrateParameterEntries(
    dashboardParameters: IDashboardParameter[] | undefined,
    workspaceParameters: IParameterMetadataObject[],
): IDashboardParameterEntry[] {
    if (!dashboardParameters || dashboardParameters.length === 0) {
        return [];
    }
    const workspaceByRef = new Map<string, IParameterMetadataObject>(
        workspaceParameters.map((wp) => [objRefToString(wp.ref), wp]),
    );
    return dashboardParameters.map((parameter) => {
        if (parameter.value !== undefined) {
            return { parameter, runtimeOverride: parameter.value };
        }
        const workspaceParameter = workspaceByRef.get(objRefToString(parameter.ref));
        const workspaceDefault =
            workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)
                ? workspaceParameter.definition.defaultValue
                : undefined;
        return { parameter, runtimeOverride: workspaceDefault };
    });
}
