// (C) 2020-2022 GoodData Corporation
import React from "react";
import { IDashboardKpiProps } from "../types";
import { DashboardKpiCore } from "./DashboardKpiCore";
import { useKpiDrill } from "../common/useKpiDrill";

/**
 * @internal
 */
export const DefaultDashboardKpiWithDrills = (props: IDashboardKpiProps): JSX.Element => {
    const { kpiWidget } = props;
    const onDrill = useKpiDrill(kpiWidget);

    return <DashboardKpiCore {...props} onDrill={onDrill} />;
};
