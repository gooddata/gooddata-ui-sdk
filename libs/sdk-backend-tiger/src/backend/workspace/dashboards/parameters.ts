// (C) 2026 GoodData Corporation

import {
    type IDashboard,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type ParameterType,
    type ParameterValue,
    throwUnexpected,
} from "@gooddata/sdk-model";

/**
 * Applies export parameter runtime-overrides onto a converted dashboard so the headless export
 * render (`?exportId=…`) shows the overridden values, landing them wherever the loader sources
 * parameters from for each tab.
 */
export function patchDashboardParametersFromExport(
    dashboard: IDashboard,
    overrides: { parametersByTab?: Record<string, IDashboardExportParameter[]> },
): IDashboard {
    const { parametersByTab } = overrides;
    if (!parametersByTab) {
        return dashboard;
    }

    // Patch each tab against the parameters the loader will source for it (mirrors the loader's
    // pickTabParametersSource): the tab's own when present, else the shared root when every tab omits.
    // Materializing per-tab keeps divergent per-tab overrides from collapsing onto the single root array.
    const tabs = dashboard.tabs;
    if (tabs?.length) {
        const everyTabOmits = tabs.every((tab) => tab.parameters === undefined);
        return {
            ...dashboard,
            tabs: tabs.map((tab) => {
                const source = tab.parameters ?? (everyTabOmits ? dashboard.parameters : undefined);
                const parameters = applyParameterOverrides(
                    source,
                    parametersByTab[tab.localIdentifier] ?? [],
                );
                return parameters === tab.parameters ? tab : { ...tab, parameters };
            }),
        };
    }

    // Legacy single-tab dashboards carry no tabs[]; the loader sources root directly.
    const parameters = applyParameterOverrides(dashboard.parameters, Object.values(parametersByTab).flat());
    return parameters === dashboard.parameters ? dashboard : { ...dashboard, parameters };
}

function applyParameterOverrides(
    parameters: IDashboardParameter[] | undefined,
    overrides: IDashboardExportParameter[],
): IDashboardParameter[] | undefined {
    if (!parameters || parameters.length === 0 || overrides.length === 0) {
        return parameters;
    }
    const valueById = new Map(overrides.map((override) => [override.id, override.value]));
    return parameters.map((parameter) => {
        const overrideValue = valueById.get(parameter.ref.identifier);
        return overrideValue === undefined
            ? parameter
            : { ...parameter, value: parseParameterValue(parameter.parameterType, overrideValue) };
    });
}

function parseParameterValue(type: ParameterType, raw: string): ParameterValue {
    switch (type) {
        case "NUMBER":
            return Number(raw);
        case "STRING":
            return raw;
        default:
            return throwUnexpected(type);
    }
}

export function getParametersMetadata(
    parametersByTab: Record<string, IDashboardExportParameter[]> | undefined,
): { parametersByTab?: Record<string, IDashboardExportParameter[]> } {
    return parametersByTab && Object.keys(parametersByTab).length > 0 ? { parametersByTab } : {};
}
