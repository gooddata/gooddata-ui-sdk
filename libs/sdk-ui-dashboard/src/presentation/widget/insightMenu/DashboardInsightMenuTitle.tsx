// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightMenuTitleProps } from "./types.js";

/**
 * @internal
 */
export const DashboardInsightMenuTitle = (props: IDashboardInsightMenuTitleProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightMenuTitleComponentProvider } = useDashboardComponentsContext();
    const InsightMenuTitleComponent = useMemo(
        () => InsightMenuTitleComponentProvider(insight, widget),
        [InsightMenuTitleComponentProvider, insight, widget],
    );

    return <InsightMenuTitleComponent {...props} />;
};
