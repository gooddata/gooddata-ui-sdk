// (C) 2020-2025 GoodData Corporation
import { ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightMenuTitleProps } from "./types.js";

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
