// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import {
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    ISeparators,
} from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    IPushData,
    OnError,
    OnFiredDrillEvent,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InsightView } from "../../../insightView";
import { availableDrillTargetsToDrillPredicates, widgetDrillsToDrillPredicates } from "./convertors";
import { filterContextToFiltersForWidget } from "../converters";

interface IInsightRendererProps {
    insightWidget: IWidget;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    separators: ISeparators;
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
    separators,
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent,
    LoadingComponent,
}) => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    const inputFilters = useMemo(() => {
        const filtersFromFilterContext = filterContextToFiltersForWidget(filterContext, insightWidget);
        return [...filtersFromFilterContext, ...(filters ?? [])];
    }, [filters, filterContext, insightWidget]);

    const { error, result, status } = useCancelablePromise(
        {
            promise: () =>
                effectiveBackend
                    .workspace(effectiveWorkspace)
                    .dashboards()
                    .getResolvedFiltersForWidget(insightWidget, inputFilters),
            onError,
        },
        [effectiveBackend, effectiveWorkspace, insightWidget, inputFilters],
    );

    const [drillsFromInsight, setDrillsFromInsight] = useState<IHeaderPredicate[]>([]);

    const effectiveDrillableItems: Array<IDrillableItem | IHeaderPredicate> = useMemo(() => {
        const drillsFromWidget = widgetDrillsToDrillPredicates(insightWidget.drills);
        return [
            ...drillsFromWidget, // drills specified in the widget definition
            ...drillableItems, // drills specified by the caller
            ...drillsFromInsight, // drills specified in the insight itself
        ];
    }, [insightWidget.drills, drillableItems, drillsFromInsight]);

    const handlePushData = useCallback((data: IPushData) => {
        if (data.availableDrillTargets) {
            setDrillsFromInsight(availableDrillTargetsToDrillPredicates(data.availableDrillTargets));
        }
    }, []);

    const chartConfig = useMemo(
        () => ({
            separators,
        }),
        [separators],
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
            pushData={handlePushData}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
