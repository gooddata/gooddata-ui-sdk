// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import { IAnalyticalBackend, IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InsightView } from "../../../insightView";
import { widgetDrillsToDrillPredicates } from "./convertors";
import { filterContextToFiltersForWidget } from "../converters";
import { addImplicitAllTimeFilter } from "./utils";
import { useDashboardViewConfig } from "./DashboardViewConfigContext";

interface IInsightRendererProps {
    insightWidget: IWidget;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    onError?: OnError;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

export const InsightRenderer: React.FC<IInsightRendererProps> = ({
    insightWidget,
    filters,
    filterContext,
    drillableItems = [],
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent,
    LoadingComponent,
}) => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);
    const dashboardViewConfig = useDashboardViewConfig();

    const inputFilters = useMemo(() => {
        const filtersFromFilterContext = filterContextToFiltersForWidget(filterContext, insightWidget);
        return [...filtersFromFilterContext, ...(filters ?? [])];
    }, [filters, filterContext, insightWidget]);

    const { error, result, status } = useCancelablePromise(
        {
            promise: async () => {
                const resolvedFilters = await effectiveBackend
                    .workspace(effectiveWorkspace)
                    .dashboards()
                    .getResolvedFiltersForWidget(insightWidget, inputFilters);

                return addImplicitAllTimeFilter(insightWidget, resolvedFilters);
            },
            onError,
        },
        [effectiveBackend, effectiveWorkspace, insightWidget, inputFilters],
    );

    const effectiveDrillableItems: Array<IDrillableItem | IHeaderPredicate> = useMemo(() => {
        const drillsFromWidget = widgetDrillsToDrillPredicates(insightWidget.drills);
        return [
            ...drillsFromWidget, // drills specified in the widget definition
            ...drillableItems, // drills specified by the caller
        ];
    }, [insightWidget.drills, drillableItems]);

    const chartConfig = useMemo(
        () => ({
            mapboxToken: dashboardViewConfig?.mapboxToken,
            separators: dashboardViewConfig?.separators,
        }),
        [dashboardViewConfig],
    );

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <InsightView
            insight={insightWidget.insight}
            filters={result}
            backend={effectiveBackend}
            workspace={effectiveWorkspace}
            drillableItems={effectiveDrillableItems}
            onDrill={onDrill}
            config={chartConfig}
            onError={onError}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
