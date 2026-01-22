// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardContent(props: IDashboardProps): ReactElement {
    const { dashboard } = props;
    const { DashboardContentComponentProvider } = useDashboardComponentsContext();
    const DashboardContentComponent = useMemo(
        () => DashboardContentComponentProvider(dashboard),
        [DashboardContentComponentProvider, dashboard],
    );

    return <DashboardContentComponent {...props} />;
}
