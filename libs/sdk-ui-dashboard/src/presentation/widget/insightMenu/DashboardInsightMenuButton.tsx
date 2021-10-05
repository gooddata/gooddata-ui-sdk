// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDashboardInsightMenuButtonProps } from "./DashboardInsightMenuButtonPropsContext";

/**
 * @internal
 */
export const DashboardInsightMenuButton = (): JSX.Element => {
    const { insight, widget } = useDashboardInsightMenuButtonProps();
    const { InsightMenuButtonComponentProvider } = useDashboardComponentsContext();
    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    return <InsightMenuButtonComponent />;
};
