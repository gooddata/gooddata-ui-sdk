// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuProps } from "../types";
import { DashboardInsightMenu } from "./DashboardInsightMenu";
import {
    DashboardInsightMenuPropsProvider,
    useDashboardInsightMenuProps,
} from "../DashboardInsightMenuPropsContext";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuInner = (): JSX.Element => {
    const props = useDashboardInsightMenuProps();

    return <DashboardInsightMenu {...props} />;
};

/**
 * @internal
 */
export const DefaultDashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    return (
        <DashboardInsightMenuPropsProvider {...props}>
            <DefaultDashboardInsightMenuInner />
        </DashboardInsightMenuPropsProvider>
    );
};
