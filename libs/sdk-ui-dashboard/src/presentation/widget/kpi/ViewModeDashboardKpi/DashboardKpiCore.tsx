// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { invariant } from "ts-invariant";

import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import {
    selectDashboardRef,
    selectDisableKpiDashboardHeadlineUnderline,
    selectFilterContextFilters,
    selectIsReadOnly,
    selectSeparators,
    useDashboardSelector,
} from "../../../../model/index.js";
import { IDashboardKpiProps } from "../types.js";

import { KpiExecutor } from "./KpiExecutor.js";
import { useKpiData } from "../common/index.js";

/**
 * @internal
 */
export const DashboardKpiCore = (props: IDashboardKpiProps): JSX.Element => {
    const {
        kpiWidget,
        alert,
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
    const disableDrillUnderline = useDashboardSelector(selectDisableKpiDashboardHeadlineUnderline);
    const separators = useDashboardSelector(selectSeparators);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);

    const kpiData = useKpiData({ kpiWidget, dashboardFilters });

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
            disableDrillUnderline={disableDrillUnderline}
            backend={backend}
            workspace={workspace}
            LoadingComponent={LoadingComponent}
            isReadOnly={isReadOnly}
        />
    );
};
