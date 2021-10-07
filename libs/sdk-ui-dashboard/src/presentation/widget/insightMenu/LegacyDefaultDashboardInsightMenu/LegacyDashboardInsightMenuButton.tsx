// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuButtonProps } from "../types";
import { LegacyInsightMenuButton } from "./LegacyInsightMenu/LegacyInsightMenuButton";
import {
    DashboardInsightMenuButtonPropsProvider,
    useDashboardInsightMenuButtonProps,
} from "../DashboardInsightMenuButtonPropsContext";

/**
 * @internal
 */
export const LegacyDashboardInsightMenuButtonInner = (): JSX.Element => {
    const props = useDashboardInsightMenuButtonProps();

    return <LegacyInsightMenuButton {...props} />;
};

/**
 * @internal
 */
export const LegacyDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    return (
        <DashboardInsightMenuButtonPropsProvider {...props}>
            <LegacyDashboardInsightMenuButtonInner />
        </DashboardInsightMenuButtonPropsProvider>
    );
};
