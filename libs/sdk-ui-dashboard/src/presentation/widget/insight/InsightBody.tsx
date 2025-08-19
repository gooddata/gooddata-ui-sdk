// (C) 2020-2025 GoodData Corporation
import React, { useMemo } from "react";

import { CustomInsightBodyComponent } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const InsightBody: CustomInsightBodyComponent = (props) => {
    const { insight, widget } = props;
    const { InsightBodyComponentProvider } = useDashboardComponentsContext();
    const RendererComponent = useMemo(
        () => InsightBodyComponentProvider(insight, widget),
        [InsightBodyComponentProvider, insight, widget],
    );

    return <RendererComponent {...props} />;
};
