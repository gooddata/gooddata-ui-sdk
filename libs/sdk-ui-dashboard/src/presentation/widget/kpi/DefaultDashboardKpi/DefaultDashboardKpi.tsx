// (C) 2020 GoodData Corporation
import React from "react";

import { DashboardKpiPropsProvider, useDashboardKpiProps } from "../DashboardKpiPropsContext";
import { DashboardKpiProps } from "../types";
import { DefaultDashboardKpiWithDrills } from "./DefaultDashboardKpiWithDrills";

/**
 * @internal
 */
export const DefaultDashboardKpiInner = (): JSX.Element => {
    const props = useDashboardKpiProps();

    return <DefaultDashboardKpiWithDrills {...props} />;
};

/**
 * @internal
 */
export const DefaultDashboardKpi = (props: DashboardKpiProps): JSX.Element => {
    return (
        <DashboardKpiPropsProvider {...props}>
            <DefaultDashboardKpiInner />
        </DashboardKpiPropsProvider>
    );
};
