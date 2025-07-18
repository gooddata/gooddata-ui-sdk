// (C) 2020-2025 GoodData Corporation
import { ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightMenuButtonProps } from "./types.js";

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
