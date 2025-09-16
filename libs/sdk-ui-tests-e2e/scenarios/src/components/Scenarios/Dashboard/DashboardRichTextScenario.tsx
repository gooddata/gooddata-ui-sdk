// (C) 2023-2025 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export function DashboardRichTextScenario() {
    return <Dashboard dashboard={Dashboards.RichText} />;
}
