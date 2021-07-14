// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState, useRef, useEffect, CSSProperties } from "react";
import flatMap from "lodash/flatMap";
import isEqual from "lodash/isEqual";
import merge from "lodash/merge";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IInsightWidget,
} from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    insightProperties,
    insightSetProperties,
    isDateFilter,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IAvailableDrillTargetAttribute,
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    ILocale,
    IntlWrapper,
    IPushData,
    OnError,
    IDrillEvent,
    OnLoadingChanged,
    useBackend,
    useCancelablePromise,
    useWorkspace,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
} from "@gooddata/sdk-ui";
import { InsightRenderer as InsightRendererImpl } from "../../../insightView/InsightRenderer";
import { InsightError } from "../../../insightView/InsightError";
import { getImplicitDrillsWithPredicates } from "./drillingUtils";
import { addImplicitAllTimeFilter, isDateFilterIgnoredForInsight } from "./utils";
import { filterContextItemsToFiltersForWidget, filterContextToFiltersForWidget } from "../../converters";
import {
    useAttributesWithDrillDown,
    useColorPalette,
    useDashboardViewConfig,
    useDashboardViewExecConfig,
    useUserWorkspaceSettings,
} from "../../contexts";
import { OnFiredDashboardViewDrillEvent, IDashboardDrillEvent } from "../../types";

const insightStyle: CSSProperties = { width: "100%", height: "100%", position: "relative" };

interface IInsightRendererProps {
    insightWidget: IInsightWidget;
    insight: IInsight;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    clientHeight?: number;
}

export const InsightRenderer: React.FC<IInsightRendererProps> = ({
    insightWidget,
    insight,
    filters,
    filterContext,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent,
    LoadingComponent,
    clientHeight,
}) => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);
    const dashboardViewConfig = useDashboardViewConfig();
    const execConfig = useDashboardViewExecConfig();
    const userWorkspaceSettings = useUserWorkspaceSettings();
    const colorPalette = useColorPalette();
    const attributesWithDrillDown = useAttributesWithDrillDown();
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [possibleDrills, setPossibleDrills] = useState<IAvailableDrillTargetAttribute[]>([]);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | null>(null);

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsVisualizationLoading(isLoading);
        // if starting loading dismiss any previous visualizationError as it is most likely obsolete
        if (isLoading) {
            setVisualizationError(null);
        }
    }, []);

    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
        },
        [onError],
    );

    const inputFilters = useMemo(
        () =>
            filters
                ? filterContextItemsToFiltersForWidget(filters, insightWidget)
                : filterContextToFiltersForWidget(filterContext, insightWidget),
        [filters, filterContext, insightWidget],
    );

    const {
        error,
        result: insightWithFilters,
        status,
    } = useCancelablePromise(
        {
            promise: async () => {
                const resolvedFilters = await effectiveBackend
                    .workspace(effectiveWorkspace)
                    .dashboards()
                    .getResolvedFiltersForWidget(insightWidget, inputFilters);

                let resolvedWithImplicitAllTime = addImplicitAllTimeFilter(insightWidget, resolvedFilters);

                if (isDateFilterIgnoredForInsight(insight)) {
                    resolvedWithImplicitAllTime = resolvedWithImplicitAllTime.filter(
                        (filter) => !isDateFilter(filter),
                    );
                }

                return effectiveBackend
                    .workspace(effectiveWorkspace)
                    .insights()
                    .getInsightWithAddedFilters(insight, resolvedWithImplicitAllTime);
            },
            onError,
        },
        [effectiveBackend, effectiveWorkspace, insightWidget, insight, inputFilters],
    );

    const insightWithAddedWidgetProperties = useMemo(() => {
        if (!insightWithFilters) {
            return insightWithFilters;
        }

        const fromWidget = insightWidget.properties;
        if (!fromWidget) {
            return insightWithFilters;
        }

        const fromWidgetWithZoomingHandled = {
            ...fromWidget,
            controls: {
                ...fromWidget?.controls,
                // we need to take the relevant feature flag into account as well
                zoomInsight: !!(userWorkspaceSettings.enableKDZooming && fromWidget?.controls?.zoomInsight),
            },
        };

        const fromInsight = insightProperties(insightWithFilters);
        const merged = merge({}, fromInsight, fromWidgetWithZoomingHandled);

        return insightSetProperties(insightWithFilters, merged);
    }, [insightWithFilters, insightWidget.properties, userWorkspaceSettings]);

    const implicitDrillDefinitions = useMemo(() => {
        return getImplicitDrillsWithPredicates(insightWidget.drills, possibleDrills, attributesWithDrillDown);
    }, [insightWidget.drills, possibleDrills, attributesWithDrillDown]);

    const implicitDrills = useMemo(() => {
        return flatMap(implicitDrillDefinitions, (info) => info.predicates);
    }, [implicitDrillDefinitions]);

    // since InsightRendererImpl only sets onDrill on the first render (this is a PlugVis API, there is no way to update onDrill there)
    // we have to sync the implicitDrillDefinitions into a ref so that the handleDrill can access the most recent value (thanks to the .current)
    // without this, handleDrill just closes over the first implicitDrillDefinitions which will never contain drillDown drills
    // as they are added *after* the first render of the PlugVis.
    const cachedImplicitDrillDefinitions = useRef(implicitDrillDefinitions);
    useEffect(() => {
        cachedImplicitDrillDefinitions.current = implicitDrillDefinitions;
    }, [implicitDrillDefinitions]);

    const handleDrill = useCallback((event: IDrillEvent) => {
        const enrichedEvent: IDashboardDrillEvent = {
            ...event,
            widgetRef: insightWidget.ref,
        };

        // if there are drillable items, we do not want to return any drillDefinitions as the implicit drills are not even used
        if (drillableItems) {
            return onDrill(enrichedEvent);
        }

        const facade = DataViewFacade.for(event.dataView);

        const definitions = cachedImplicitDrillDefinitions.current;

        const matchingImplicitDrillDefinitions = definitions.filter((info) => {
            return event.drillContext.intersection.some((intersection) =>
                isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
            );
        });

        return onDrill({
            ...enrichedEvent,
            drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
        });
    }, []);

    const handlePushData = useCallback((data: IPushData): void => {
        if (data.availableDrillTargets?.attributes) {
            setPossibleDrills((prevValue) => {
                // only set possible drills if really different to prevent other hooks firing unnecessarily
                if (!isEqual(prevValue, data.availableDrillTargets.attributes)) {
                    return data.availableDrillTargets.attributes;
                }

                // returning prevValue effectively skips the setState
                return prevValue;
            });
        }
    }, []);

    const chartConfig = useMemo(
        () => ({
            mapboxToken: dashboardViewConfig?.mapboxToken,
            separators: dashboardViewConfig?.separators,
            forceDisableDrillOnAxes: !drillableItems, // to keep in line with KD, enable axes drilling only if using explicit drills
        }),
        [dashboardViewConfig, drillableItems],
    );

    // we need sdk-ui intl wrapper (this is how InsightView does this as well) for error messages etc.
    // ideally, we would merge InternalIntlWrapper and sdk-ui intl wrapper, but there is no clean way to do that
    const locale = dashboardViewConfig?.locale ?? userWorkspaceSettings?.locale;
    /*
     * if there are drillable items from the user, use them and only them
     *
     * also pass any drillable items only if there is an onDrill specified, otherwise pass undefined
     * so that the items are not shown as active since nothing can happen on click without the onDrill provided
     */
    const drillableItemsToUse = onDrill ? drillableItems ?? implicitDrills : undefined;

    const insightPositionStyle: CSSProperties = useMemo(() => {
        return {
            width: "100%",
            height: "100%",
            position:
                // Headline violates the layout contract.
                // It should fit parent height and adapt to it as other visualizations.
                // Now, it works differently for the Headline - parent container adapts to Headline size.
                insight && insightVisualizationUrl(insight).includes("headline") ? "relative" : "absolute",
        };
    }, [insight]);
    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {(status === "loading" || status === "pending" || isVisualizationLoading) && (
                        <LoadingComponent />
                    )}
                    {(error || visualizationError) && (
                        <InsightError
                            error={error || visualizationError}
                            ErrorComponent={ErrorComponent}
                            clientHeight={userWorkspaceSettings?.enableKDWidgetCustomHeight && clientHeight}
                            height={null} // make sure the error is aligned to the top (this is the behavior in gdc-dashboards)
                        />
                    )}
                    {status === "success" && (
                        <InsightRendererImpl
                            insight={insightWithAddedWidgetProperties}
                            backend={effectiveBackend}
                            workspace={effectiveWorkspace}
                            drillableItems={drillableItemsToUse}
                            onDrill={onDrill ? handleDrill : undefined}
                            config={chartConfig}
                            execConfig={execConfig}
                            onLoadingChanged={handleLoadingChanged}
                            locale={dashboardViewConfig.locale ?? (userWorkspaceSettings.locale as ILocale)}
                            settings={userWorkspaceSettings}
                            colorPalette={colorPalette}
                            onError={handleError}
                            pushData={handlePushData}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                        />
                    )}
                </IntlWrapper>
            </div>
        </div>
    );
};
