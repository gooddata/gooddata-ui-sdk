// (C) 2020-2025 GoodData Corporation
import { useMemo } from "react";

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
