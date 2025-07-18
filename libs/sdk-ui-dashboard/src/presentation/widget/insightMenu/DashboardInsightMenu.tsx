// (C) 2020-2025 GoodData Corporation
import { ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightMenuProps } from "./types.js";

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
