// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuProps } from "../types";
import { LegacyInsightMenu } from "./LegacyInsightMenu";
import {
    DashboardInsightMenuPropsProvider,
    useDashboardInsightMenuProps,
} from "../DashboardInsightMenuPropsContext";

/**
 * @internal
 */
export const LegacyDashboardInsightMenuInner = (): JSX.Element => {
    const props = useDashboardInsightMenuProps();

    return <LegacyInsightMenu {...props} />;
};

/**
 * @internal
 */
export const LegacyDashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    return (
        <DashboardInsightMenuPropsProvider {...props}>
            <LegacyDashboardInsightMenuInner />
        </DashboardInsightMenuPropsProvider>
    );
};
