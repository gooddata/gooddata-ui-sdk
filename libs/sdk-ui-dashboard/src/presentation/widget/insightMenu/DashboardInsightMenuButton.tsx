// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightMenuButtonProps } from "./types.js";

/**
 * @internal
 */
export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    const { insight, widget } = props;
    const { InsightMenuButtonComponentProvider } = useDashboardComponentsContext();
    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    return <InsightMenuButtonComponent {...props} />;
};
