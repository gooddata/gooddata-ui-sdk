// (C) 2023-2026 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

export function DashboardRichTextScenario() {
    return <Dashboard dashboard={Dashboards.RichText} />;
}
