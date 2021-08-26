// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightProps } from "../types";
import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog";
import { DashboardInsightPropsProvider, useDashboardInsightProps } from "../DashboardInsightPropsContext";

/**
 * @internal
 */
export const DefaultDashboardInsightInner = (): JSX.Element => {
    const props = useDashboardInsightProps();

    return <DashboardInsightWithDrillDialog {...props} />;
};

/**
 * @internal
 */
export const DefaultDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return (
        <DashboardInsightPropsProvider {...props}>
            <DefaultDashboardInsightInner />
        </DashboardInsightPropsProvider>
    );
};
