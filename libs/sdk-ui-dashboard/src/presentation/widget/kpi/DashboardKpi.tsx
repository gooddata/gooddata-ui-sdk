// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardKpiProps } from "./types.js";

/**
 * @internal
 */
export const DashboardKpi = (props: IDashboardKpiProps): JSX.Element => {
    const { KpiWidgetComponentSet } = useDashboardComponentsContext();
    const { kpiWidget } = props;
    const KpiComponent = useMemo(
        () => KpiWidgetComponentSet.MainComponentProvider(kpiWidget.kpi, kpiWidget),
        [KpiWidgetComponentSet, kpiWidget],
    );

    return <KpiComponent {...props} />;
};
