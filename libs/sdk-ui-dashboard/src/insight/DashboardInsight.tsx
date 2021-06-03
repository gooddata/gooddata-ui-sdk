// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import { DashboardInsightProps } from "./types";

/**
 * @internal
 */
export const DashboardInsight = (props: DashboardInsightProps): JSX.Element => {
    const { InsightComponent } = useDashboardComponentsContext();

    return <InsightComponent {...props} />;
};
