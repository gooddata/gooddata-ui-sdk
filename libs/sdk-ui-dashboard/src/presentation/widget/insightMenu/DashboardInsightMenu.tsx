// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { IDashboardInsightMenuProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardInsightMenu = (props: IDashboardInsightMenuProps): ReactElement => {
    const { insight, widget } = props;
    const { InsightMenuComponentProvider } = useDashboardComponentsContext();
    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    return <InsightMenuComponent {...props} />;
};
