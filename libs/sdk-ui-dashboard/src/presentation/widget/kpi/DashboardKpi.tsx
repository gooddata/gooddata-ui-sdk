// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardKpiProps } from "./types";

/**
 * @internal
 */
export const DashboardKpi = (props: IDashboardKpiProps): JSX.Element => {
    const { KpiComponentProvider } = useDashboardComponentsContext();
    const { kpiWidget } = props;
    const KpiComponent = useMemo(
        () => KpiComponentProvider(kpiWidget.kpi, kpiWidget),
        [KpiComponentProvider, kpiWidget],
    );

    return <KpiComponent {...props} />;
};
