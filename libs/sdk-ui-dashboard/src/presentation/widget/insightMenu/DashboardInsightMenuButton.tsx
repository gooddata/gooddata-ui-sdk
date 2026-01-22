// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardInsightMenuButtonProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardInsightMenuButton(props: IDashboardInsightMenuButtonProps): ReactElement {
    const { insight, widget } = props;
    const { InsightMenuButtonComponentProvider } = useDashboardComponentsContext();
    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    return <InsightMenuButtonComponent {...props} />;
}
