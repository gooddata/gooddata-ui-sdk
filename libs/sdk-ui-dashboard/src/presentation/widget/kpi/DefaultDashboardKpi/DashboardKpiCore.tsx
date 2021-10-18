// (C) 2020 GoodData Corporation
import React from "react";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import { useDashboardComponentsContext } from "../../../dashboardContexts";
import {
    selectDashboardRef,
    selectFilterContextFilters,
    selectIsReadOnly,
    selectSeparators,
    selectSettings,
    useDashboardSelector,
} from "../../../../model";
import { DashboardKpiProps } from "../types";

import { KpiExecutor } from "./KpiExecutor";
import { useKpiData } from "./useKpiData";

/**
 * @internal
 */
export const DashboardKpiCore = (props: DashboardKpiProps): JSX.Element => {
    const {
        kpiWidget,
        alert,
        filters,
        onFiltersChange,
        onDrill,
        onError,
        backend: customBackend,
        workspace: customWorkspace,
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    } = props;

    invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    const backend = useBackendStrict(customBackend);
    const workspace = useWorkspaceStrict(customWorkspace);

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const settings = useDashboardSelector(selectSettings);
    const separators = useDashboardSelector(selectSeparators);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);

    const kpiData = useKpiData({
        kpiWidget,
        backend,
        filters,
        dashboardFilters,
        workspace,
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
            separators={separators}
            disableDrillUnderline={settings.disableKpiDashboardHeadlineUnderline}
            backend={backend}
            workspace={workspace}
            LoadingComponent={LoadingComponent}
            isReadOnly={isReadOnly}
        />
    );
};
