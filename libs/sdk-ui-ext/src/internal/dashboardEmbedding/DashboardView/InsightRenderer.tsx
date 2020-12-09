// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { IAnalyticalBackend, IFilterContext, ITempFilterContext, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter, IInsight } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    ILocale,
    OnError,
    OnFiredDrillEvent,
    OnLoadingChanged,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InsightRenderer as InsightRendererImpl } from "../../../insightView/InsightRenderer";
import { widgetDrillsToDrillPredicates } from "./convertors";
import { filterContextToFiltersForWidget } from "../converters";
import { addImplicitAllTimeFilter } from "./utils";
import { useDashboardViewConfig } from "./DashboardViewConfigContext";
import { useUserWorkspaceSettings } from "./UserWorkspaceSettingsContext";
import { useColorPalette } from "./ColorPaletteContext";

interface IInsightRendererProps {
    insightWidget: IWidget;
    insight: IInsight;
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
    insight,
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
    const userWorkspaceSettings = useUserWorkspaceSettings();
    const colorPalette = useColorPalette();
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);

    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading !== isVisualizationLoading) {
                setIsVisualizationLoading(isLoading);
            }
        },
        [isVisualizationLoading],
    );

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

                const resolvedWithImplicitAllTime = addImplicitAllTimeFilter(insightWidget, resolvedFilters);

                return effectiveBackend
                    .workspace(effectiveWorkspace)
                    .insights()
                    .getInsightWithAddedFilters(insight, resolvedWithImplicitAllTime);
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

    return (
        <>
            {(status === "loading" || status === "pending" || isVisualizationLoading) && <LoadingComponent />}
            {status === "error" && <ErrorComponent message={error.message} />}
            <InsightRendererImpl
                insight={result}
                backend={effectiveBackend}
                workspace={effectiveWorkspace}
                drillableItems={effectiveDrillableItems}
                onDrill={onDrill}
                config={chartConfig}
                onLoadingChanged={handleLoadingChanged}
                locale={dashboardViewConfig.locale ?? (userWorkspaceSettings.locale as ILocale)}
                settings={userWorkspaceSettings}
                colorPalette={colorPalette}
                onError={onError}
                ErrorComponent={ErrorComponent}
                LoadingComponent={LoadingComponent}
            />
        </>
    );
};
