// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IInsightBodyProps } from "./types.js";

/**
 * @internal
 */
export function InsightBody(props: IInsightBodyProps) {
    const { insight, widget } = props;
    const { InsightBodyComponentProvider } = useDashboardComponentsContext();
    const RendererComponent = useMemo(
        () => InsightBodyComponentProvider(insight, widget),
        [InsightBodyComponentProvider, insight, widget],
    );

    return <RendererComponent {...props} />;
}
