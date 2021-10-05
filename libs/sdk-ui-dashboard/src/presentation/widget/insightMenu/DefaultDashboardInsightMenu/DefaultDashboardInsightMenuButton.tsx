// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuButtonProps } from "../types";
import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton";
import {
    DashboardInsightMenuButtonPropsProvider,
    useDashboardInsightMenuButtonProps,
} from "../DashboardInsightMenuButtonPropsContext";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButtonInner = (): JSX.Element => {
    const props = useDashboardInsightMenuButtonProps();

    return <DashboardInsightMenuButton {...props} />;
};

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    return (
        <DashboardInsightMenuButtonPropsProvider {...props}>
            <DefaultDashboardInsightMenuButtonInner />
        </DashboardInsightMenuButtonPropsProvider>
    );
};
