// (C) 2020-2022 GoodData Corporation
import React from "react";
import { IDashboardKpiProps } from "../types.js";
import { DashboardKpiCore } from "./DashboardKpiCore.js";
import { useKpiDrill } from "../common/useKpiDrill.js";

/**
 * @internal
 */
export const DefaultDashboardKpiWithDrills = (props: IDashboardKpiProps): JSX.Element => {
    const { kpiWidget } = props;
    const onDrill = useKpiDrill(kpiWidget);

    return <DashboardKpiCore {...props} onDrill={onDrill} />;
};
