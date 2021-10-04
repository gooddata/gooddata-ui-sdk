// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDashboardInsightProps } from "./DashboardInsightPropsContext";

/**
 * @internal
 */
export const DashboardInsight = (): JSX.Element => {
    const { insight, widget } = useDashboardInsightProps();
    const { InsightComponentProvider } = useDashboardComponentsContext();
    const InsightComponent = useMemo(
        () => InsightComponentProvider(insight, widget),
        [InsightComponentProvider, insight, widget],
    );

    return <InsightComponent />;
};
