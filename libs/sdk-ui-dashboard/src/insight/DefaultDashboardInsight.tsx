// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState, useRef, useEffect, CSSProperties } from "react";
import flatMap from "lodash/flatMap";
import isEqual from "lodash/isEqual";
import merge from "lodash/merge";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    insightProperties,
    insightSetProperties,
    isDateFilter,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IAvailableDrillTargetAttribute,
    IntlWrapper,
    IPushData,
    OnError,
    IDrillEvent,
    OnLoadingChanged,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
} from "@gooddata/sdk-ui";
import { IDashboardDrillEvent } from "@gooddata/sdk-ui-ext";
import { InsightRenderer as InsightRendererImpl } from "@gooddata/sdk-ui-ext/esm/insightView/InsightRenderer";
import { InsightError } from "@gooddata/sdk-ui-ext/esm/insightView/InsightError";
import {
    filterContextItemsToFiltersForWidget,
    filterContextToFiltersForWidget,
} from "@gooddata/sdk-ui-ext/esm/dashboardView/converters";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import {
    useDashboardSelector,
    selectColorPalette,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
    selectAttributesWithDrillDown,
    selectFilterContext,
} from "../model";
import { getImplicitDrillsWithPredicates } from "../model/_staging/drills/drillingUtils";
import { addImplicitAllTimeFilter, isDateFilterIgnoredForInsight } from "./utils";
import { DashboardInsightProps } from "./types";

const insightStyle: CSSProperties = { width: "100%", height: "100%", position: "relative" };

/**
 * @internal
 */
export const DefaultDashboardInsight: React.FC<DashboardInsightProps> = ({
    insightWidget,
    insight,
    filters,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent: CustomErrorComponent,
    LoadingComponent: CustomLoadingComponent,
    clientHeight,
}) => {
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const filterContext = useDashboardSelector(selectFilterContext);
    const separators = useDashboardSelector(selectSeparators);
    const mapboxToken = useDashboardSelector(selectMapboxToken);
    const locale = useDashboardSelector(selectLocale);
    const settings = useDashboardSelector(selectSettings);
    const colorPalette = useDashboardSelector(selectColorPalette);
    const attributesWithDrillDown = useDashboardSelector(selectAttributesWithDrillDown);

    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [possibleDrills, setPossibleDrills] = useState<IAvailableDrillTargetAttribute[]>([]);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsVisualizationLoading(isLoading);
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

    const insightWithAddedFilters = useCancelablePromise(
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
        [effectiveBackend, effectiveWorkspace, insightWidget, inputFilters],
    );

    const insightWithAddedWidgetProperties = useMemo(() => {
        if (!insightWithAddedFilters.result) {
            return insightWithAddedFilters.result;
        }

        const fromWidget = insightWidget.properties;
        if (!fromWidget) {
            return insightWithAddedFilters.result;
        }

        const fromWidgetWithZoomingHandled = {
            ...fromWidget,
            controls: {
                ...fromWidget?.controls,
                // we need to take the relevant feature flag into account as well
                zoomInsight: !!(settings.enableKDZooming && fromWidget?.controls?.zoomInsight),
            },
        };

        const fromInsight = insightProperties(insightWithAddedFilters.result);
        const merged = merge({}, fromInsight, fromWidgetWithZoomingHandled);

        return insightSetProperties(insightWithAddedFilters.result, merged);
    }, [insightWithAddedFilters.result, insightWidget.properties, settings]);

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
        if (drillableItems && typeof onDrill === "function") {
            return onDrill(enrichedEvent);
        }

        const facade = DataViewFacade.for(event.dataView);

        const definitions = cachedImplicitDrillDefinitions.current;

        const matchingImplicitDrillDefinitions = definitions.filter((info) => {
            return event.drillContext.intersection?.some((intersection) =>
                isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
            );
        });

        return (
            typeof onDrill === "function" &&
            onDrill({
                ...enrichedEvent,
                drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
            })
        );
    }, []);

    const handlePushData = useCallback((data: IPushData): void => {
        if (data.availableDrillTargets?.attributes) {
            setPossibleDrills((prevValue) => {
                // only set possible drills if really different to prevent other hooks firing unnecessarily
                if (!isEqual(prevValue, data.availableDrillTargets?.attributes)) {
                    return data.availableDrillTargets!.attributes!;
                }

                // returning prevValue effectively skips the setState
                return prevValue;
            });
        }
    }, []);

    const chartConfig = useMemo(
        () => ({
            mapboxToken,
            separators,
            forceDisableDrillOnAxes: !drillableItems, // to keep in line with KD, enable axes drilling only if using explicit drills
        }),
        [separators, mapboxToken, drillableItems],
    );

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

    const error = insightWithAddedFilters.error ?? visualizationError;

    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {(insightWithAddedFilters.status === "loading" ||
                        insightWithAddedFilters.status === "pending" ||
                        isVisualizationLoading) && <LoadingComponent />}
                    {error && (
                        <InsightError
                            error={error}
                            ErrorComponent={ErrorComponent}
                            clientHeight={settings?.enableKDWidgetCustomHeight ? clientHeight : undefined}
                            height={null} // make sure the error is aligned to the top (this is the behavior in gdc-dashboards)
                        />
                    )}
                    {insightWithAddedFilters.status === "success" && (
                        <InsightRendererImpl
                            insight={insightWithAddedWidgetProperties}
                            backend={effectiveBackend}
                            workspace={effectiveWorkspace}
                            drillableItems={drillableItemsToUse}
                            onDrill={onDrill ? handleDrill : undefined}
                            config={chartConfig}
                            onLoadingChanged={handleLoadingChanged}
                            locale={locale}
                            settings={settings as IUserWorkspaceSettings}
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
