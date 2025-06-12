// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardProps } from "./types.js";

/**
 * @internal
 */
export const DashboardContent = (props: IDashboardProps): JSX.Element => {
    const { dashboard } = props;
    const { DashboardContentComponentProvider } = useDashboardComponentsContext();
    const DashboardContentComponent = useMemo(
        () => DashboardContentComponentProvider(dashboard),
        [DashboardContentComponentProvider, dashboard],
    );

    return <DashboardContentComponent {...props} />;
};
