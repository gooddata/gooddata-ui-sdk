// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDashboardKpiProps } from "./DashboardKpiPropsContext";

/**
 * @internal
 */
export const DashboardKpi = (): JSX.Element => {
    const { KpiComponentProvider } = useDashboardComponentsContext();
    const { kpiWidget } = useDashboardKpiProps();
    const KpiComponent = useMemo(
        () => KpiComponentProvider(kpiWidget.kpi, kpiWidget),
        [KpiComponentProvider, kpiWidget],
    );

    return <KpiComponent />;
};
