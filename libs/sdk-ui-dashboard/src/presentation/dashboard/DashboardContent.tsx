// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { IDashboardProps } from "./types.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

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
