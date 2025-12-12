// (C) 2020-2025 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardInsightMenuProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

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
