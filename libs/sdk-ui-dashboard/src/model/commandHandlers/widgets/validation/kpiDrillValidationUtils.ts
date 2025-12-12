// (C) 2022-2025 GoodData Corporation

import { type KpiDrillDefinition, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { type ILegacyDashboard } from "../../../../types.js";

export function validateKpiDrillTarget(
    drill: KpiDrillDefinition,
    availableLegacyDashboards: ILegacyDashboard[] = [],
): void {
    const relevantDashboard = availableLegacyDashboards.find((dash) =>
        areObjRefsEqual(dash.ref, drill.target),
    );
    if (!relevantDashboard) {
        throw Error(`Dashboard with ref ${objRefToString(drill.target)} was not found.`);
    }

    if (!relevantDashboard.tabs.some((tab) => tab.localIdentifier === drill.tab)) {
        throw Error(
            `Dashboard with ref ${objRefToString(drill.target)} does not contain tab with identifier ${
                drill.tab
            }.`,
        );
    }
}
