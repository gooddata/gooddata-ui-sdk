// (C) 2021-2026 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { idRef } from "../../../../../../sdk-model";
import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects;

export function DashboardStageNameScenario() {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.KDWithStageName)} />;
}
