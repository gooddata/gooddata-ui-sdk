// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardInsightMenuTitleProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardInsightMenuTitle(props: IDashboardInsightMenuTitleProps): ReactElement {
    const { insight, widget } = props;
    const { InsightMenuTitleComponentProvider } = useDashboardComponentsContext();
    const InsightMenuTitleComponent = useMemo(
        () => InsightMenuTitleComponentProvider(insight, widget),
        [InsightMenuTitleComponentProvider, insight, widget],
    );

    return <InsightMenuTitleComponent {...props} />;
}
