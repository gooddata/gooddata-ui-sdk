// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardProps } from "./types.js";

/**
 * @internal
 */
export const DashboardContent = (props: IDashboardProps): ReactElement => {
    const { dashboard } = props;
    const { DashboardContentComponentProvider } = useDashboardComponentsContext();
    const DashboardContentComponent = useMemo(
        () => DashboardContentComponentProvider(dashboard),
        [DashboardContentComponentProvider, dashboard],
    );

    return <DashboardContentComponent {...props} />;
};
