// (C) 2020 GoodData Corporation
import React from "react";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import invariant from "ts-invariant";
import { useKpiData } from "@gooddata/sdk-ui-ext/esm/dashboardView/hooks/internal";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import {
    useDashboardSelector,
    selectSeparators,
    selectIsReadOnly,
    selectFilterContext,
    selectSettings,
    selectDashboardRef,
} from "../model";
import { KpiExecutor } from "./KpiExecutor";
import { DashboardKpiProps } from "./types";

/**
 * @internal
 */
export const DefaultDashboardKpi: React.FC<DashboardKpiProps> = ({
    kpiWidget,
    alert,
    filters,
    onFiltersChange,
    drillableItems,
    onDrill,
    onError,
    backend: customBackend,
    workspace: customWorkspace,
    ErrorComponent: CustomErrorComponent,
    LoadingComponent: CustomLoadingComponent,
}) => {
    invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    const backend = useBackendStrict(customBackend);
    const workspace = useWorkspaceStrict(customWorkspace);

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const filterContext = useDashboardSelector(selectFilterContext);
    const settings = useDashboardSelector(selectSettings);
    const separators = useDashboardSelector(selectSeparators);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);

    const kpiData = useKpiData({
        kpiWidget,
        backend,
        filters,
        filterContext,
        workspace,
        onError,
    });

    if (kpiData.status === "loading" || kpiData.status === "pending") {
        return <LoadingComponent />;
    }

    if (kpiData.status === "error") {
        return <ErrorComponent message={kpiData.error.message} />;
    }

    return (
        <KpiExecutor
            dashboardRef={dashboardRef}
            kpiWidget={kpiWidget}
            primaryMeasure={kpiData.result.primaryMeasure}
            secondaryMeasure={kpiData.result.secondaryMeasure}
            alert={alert}
            allFilters={kpiData.result.allFilters}
            effectiveFilters={kpiData.result.effectiveFilters}
            onFiltersChange={onFiltersChange}
            onDrill={onDrill}
            onError={onError}
            drillableItems={drillableItems}
            separators={separators}
            disableDrillUnderline={settings.disableKpiDashboardHeadlineUnderline}
            backend={backend}
            workspace={workspace}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
            isReadOnly={isReadOnly}
        />
    );
};
