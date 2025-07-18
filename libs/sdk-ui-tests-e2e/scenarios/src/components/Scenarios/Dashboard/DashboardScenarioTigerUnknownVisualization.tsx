// (C) 2023-2025 GoodData Corporation
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export function DashboardScenarioTigerUnknownVisualization() {
    return <Dashboard dashboard={idRef(Dashboards.DashboardWithUnknownVisualizationClass)} />;
}
