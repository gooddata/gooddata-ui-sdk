// (C) 2021-2025 GoodData Corporation
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const dashboardRef = idRef(Dashboards.DashboardTableDrillDown);

export function DashboardTableDrillDown() {
    return <Dashboard dashboard={dashboardRef} />;
}
