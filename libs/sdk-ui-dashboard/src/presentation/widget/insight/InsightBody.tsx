// (C) 2020-2025 GoodData Corporation

import { useMemo } from "react";

import { IInsightBodyProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

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
