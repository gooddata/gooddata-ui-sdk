// (C) 2022 GoodData Corporation
import React from "react";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import { useDashboardComponentsContext } from "../../../dashboardContexts";
import { selectFilterContextFilters, useDashboardSelector } from "../../../../model";
import { IDashboardKpiProps } from "../types";
import { useKpiData } from "../common";
import { EditableKpiExecutor } from "./EditableKpiExecutor";

export const EditableDashboardKpi = (props: IDashboardKpiProps) => {
    const {
        kpiWidget,
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

    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);

    const kpiData = useKpiData({
        kpiWidget,
        backend,
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
        <EditableKpiExecutor
            kpiWidget={kpiWidget}
            primaryMeasure={kpiData.result.primaryMeasure}
            secondaryMeasure={kpiData.result.secondaryMeasure}
            effectiveFilters={kpiData.result.effectiveFilters}
            onError={onError}
            LoadingComponent={LoadingComponent}
        />
    );
};
