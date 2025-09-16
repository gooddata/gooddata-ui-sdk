// (C) 2023-2025 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { idRef } from "../../../../../../sdk-model";
import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects as TigerMDObjects;

export function DashboardShortenMetricNameScenario() {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.KDUsingLongNameMetric)} />;
}
