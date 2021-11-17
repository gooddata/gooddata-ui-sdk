// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardInsightProps } from "./types";

/**
 * @internal
 */
export const DashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightComponentProvider } = useDashboardComponentsContext();
    const InsightComponent = useMemo(
        () => InsightComponentProvider(insight, widget),
        [InsightComponentProvider, insight, widget],
    );

    return <InsightComponent {...props} />;
};
