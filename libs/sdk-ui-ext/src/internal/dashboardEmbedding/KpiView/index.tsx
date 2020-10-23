// (C) 2020 GoodData Corporation
import React from "react";
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { InvariantError } from "ts-invariant";

import { useKpiData } from "./utils";
import { KpiExecutor } from "./KpiExecutor";

export interface IKpiViewProps {
    /**
     * The KPI to execute and display.
     */
    kpiWidget: IWidget;

    /**
     * Optionally, specify filters to be applied to the KPI.
     */
    filters?: IFilter[];

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the KPI exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Component to render if embedding fails.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the KPI is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

/**
 * Takes a KPI widget and executes it and displays the result.
 * @internal
 */
export const KpiView: React.FC<IKpiViewProps> = ({
    kpiWidget,
    filters,
    drillableItems,
    onDrill,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    if (!kpiWidget.kpi) {
        throw new InvariantError("The provided widget is not a KPI widget.");
    }

    const { error, result, status } = useKpiData({
        kpiWidget,
        backend,
        filters,
        workspace,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <KpiExecutor
            title={kpiWidget.title}
            primaryMeasure={result.primaryMeasure}
            secondaryMeasure={result.secondaryMeasure}
            filters={result.filters}
            onDrill={onDrill}
            drillableItems={drillableItems}
            backend={backend}
            workspace={workspace}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
