// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

export function EmptyDashboardError() {
    const intl = useIntl();
    const { ErrorComponent } = useDashboardComponentsContext();
    return (
        <ErrorComponent
            className="s-layout-error"
            message={intl.formatMessage({ id: "dashboard.error.empty.heading" })}
            description={intl.formatMessage({ id: "dashboard.error.empty.text" })}
        />
    );
}
