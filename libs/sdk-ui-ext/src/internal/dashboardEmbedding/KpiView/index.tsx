// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import compact from "lodash/compact";
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    IWidgetAlert,
    ISeparators,
} from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    OnError,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import { useKpiData } from "./utils";
import { KpiExecutor } from "./KpiExecutor";

export interface IKpiViewProps {
    /**
     * The KPI to execute and display.
     */
    kpiWidget: IWidget;

    /**
     * Optionally, specify alert set by the current user to this KPI.
     */
    alert?: IWidgetAlert;

    /**
     * Optionally, specify filters to be applied to the KPI.
     */
    filters?: IFilter[];

    /**
     * The filter context used in the parent dashboard.
     */
    filterContext?: IFilterContext | ITempFilterContext;

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

    /**
     * Regional number formatting
     */
    separators: ISeparators;

    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableDrillUnderline?: boolean;

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Called in case of any error, either in the dashboard loading or any of the widgets execution.
     */
    onError?: OnError;

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

    /**
     * Width of the parent element as measured when rendered.
     */
    clientWidth?: number;
}

/**
 * Takes a KPI widget and executes it and displays the result.
 * @internal
 */
export const KpiView: React.FC<IKpiViewProps> = ({
    kpiWidget,
    alert,
    filters,
    filterContext,
    drillableItems = [],
    separators,
    disableDrillUnderline,
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
    clientWidth,
}) => {
    invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

    const { error, result, status } = useKpiData({
        kpiWidget,
        backend,
        filters,
        filterContext,
        workspace,
        onError,
    });

    // add drilling predicate for the metric if the KPI has any drills defined from KPI dashboards
    const effectiveDrillableItems: Array<IDrillableItem | IHeaderPredicate> = useMemo(
        () => compact([...drillableItems, kpiWidget.drills.length > 0 && kpiWidget.kpi.metric]),
        [kpiWidget, drillableItems],
    );

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <KpiExecutor
            kpiWidget={kpiWidget}
            primaryMeasure={result.primaryMeasure}
            secondaryMeasure={result.secondaryMeasure}
            alert={alert}
            filters={result.filters}
            onDrill={onDrill}
            onError={onError}
            drillableItems={effectiveDrillableItems}
            separators={separators}
            disableDrillUnderline={disableDrillUnderline}
            backend={backend}
            workspace={workspace}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
            clientWidth={clientWidth}
        />
    );
};
