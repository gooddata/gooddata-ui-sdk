// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { CustomInsightBodyComponent } from "./types.js";

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
