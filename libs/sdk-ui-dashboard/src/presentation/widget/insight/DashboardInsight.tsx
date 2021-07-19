// (C) 2020 GoodData Corporation
import React from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const DashboardInsight = (): JSX.Element => {
    const { InsightComponent } = useDashboardComponentsContext();

    return <InsightComponent />;
};
