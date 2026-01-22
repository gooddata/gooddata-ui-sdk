// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardInsightMenuProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardInsightMenu(props: IDashboardInsightMenuProps): ReactElement {
    const { insight, widget } = props;
    const { InsightMenuComponentProvider } = useDashboardComponentsContext();
    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    return <InsightMenuComponent {...props} />;
}
