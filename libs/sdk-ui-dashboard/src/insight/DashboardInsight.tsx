// (C) 2020 GoodData Corporation
import React from "react";

import { useDashboardComponentsContext } from "../dashboardAux";

import { IDashboardInsightCoreProps } from "./types";

/**
 * @internal
 */
export const DashboardInsight = (props: IDashboardInsightCoreProps): JSX.Element => {
    const { InsightComponent } = useDashboardComponentsContext();

    return <InsightComponent {...props} />;
};
