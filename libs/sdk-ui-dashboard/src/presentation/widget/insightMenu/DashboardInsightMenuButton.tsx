// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { IDashboardInsightMenuButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): ReactElement => {
    const { insight, widget } = props;
    const { InsightMenuButtonComponentProvider } = useDashboardComponentsContext();
    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    return <InsightMenuButtonComponent {...props} />;
};
