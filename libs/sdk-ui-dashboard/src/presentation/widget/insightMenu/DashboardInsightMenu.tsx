// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDashboardInsightMenuProps } from "./DashboardInsightMenuPropsContext";

/**
 * @internal
 */
export const DashboardInsightMenu = (): JSX.Element => {
    const { insight, widget } = useDashboardInsightMenuProps();
    const { InsightMenuComponentProvider } = useDashboardComponentsContext();
    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    return <InsightMenuComponent />;
};
