// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts";
import { CustomInsightRenderer } from "./types";

/**
 * @internal
 */
export const InsightRenderer: CustomInsightRenderer = (props) => {
    const { insight, widget } = props;
    const { InsightRendererProvider } = useDashboardComponentsContext();
    const RendererComponent = useMemo(
        () => InsightRendererProvider(insight, widget),
        [InsightRendererProvider, insight, widget],
    );

    return <RendererComponent {...props} />;
};
