// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightProps } from "./types.js";

/**
 * @internal
 */
export const DashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightWidgetComponentSet } = useDashboardComponentsContext();
    const InsightComponent = useMemo(
        () => InsightWidgetComponentSet.MainComponentProvider(insight, widget),
        [InsightWidgetComponentSet, insight, widget],
    );

    return <InsightComponent {...props} />;
};
