// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects;

export function DashboardPivotTableScenario() {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.PivotTableDashboard)} />;
}
