// (C) 2007-2025 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import cx from "classnames";
import { isEqual } from "lodash-es";
import mapboxgl from "mapbox-gl";
import { WrappedComponentProps } from "react-intl";
import { invariant } from "ts-invariant";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    DataViewFacade,
    GeoTokenMissingSdkError,
    IDrillConfig,
    IHeaderPredicate,
    OnError,
} from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import {
    DEFAULT_CLUSTER_LABELS_CONFIG,
    DEFAULT_CLUSTER_LAYER_NAME,
    DEFAULT_DATA_SOURCE_NAME,
    DEFAULT_LAYER_NAME,
    DEFAULT_MAPBOX_OPTIONS,
    DEFAULT_TOOLTIP_OPTIONS,
    INTERACTION_EVENTS,
    LAYER_STYLE_LABEL_PREFIX,
    ZOOM_CONTROLS_HEIGHT,
} from "./constants/geoChart.js";
import {
    createClusterLabels,
    createClusterPoints,
    createPushpinDataLayer,
    createPushpinFilter,
    createUnclusterPoints,
} from "./geoChartDataLayers.js";
import { IGeoDataSourceProps, createPushpinDataSource } from "./geoChartDataSource.js";
import { handlePushpinMouseEnter, handlePushpinMouseLeave } from "./geoChartTooltip.js";
import { IGeoConfig, IGeoData, IGeoLngLat } from "../../GeoChart.js";
import {
    isClusteringAllowed,
    isColorAssignmentItemChanged,
    isPointsConfigChanged,
} from "./helpers/geoChart/common.js";
import { handleGeoPushpinDrillEvent } from "./helpers/geoChart/drilling.js";
import { getViewportOptions } from "./helpers/geoChart/viewport.js";

/**
 * @internal
 */
export interface IGeoChartRendererProps extends WrappedComponentProps {
    config: IGeoConfig;
    drillableItems: IHeaderPredicate[];
    drillConfig: IDrillConfig;
    dataView: IDataView;
    geoData: IGeoData;
    colorStrategy: IColorStrategy;
    afterRender(): void;
    onCenterPositionChanged(center: IGeoLngLat): void;
    onZoomChanged(zoom: number): void;
    onError?: OnError;
}

function GeoChartRenderer({
    config = { mapboxToken: "" },
    drillableItems,
    drillConfig,
    dataView,
    geoData,
    colorStrategy,
    afterRender = () => {},
    onCenterPositionChanged = () => {},
    onZoomChanged = () => {},
    onError,
    intl,
}: IGeoChartRendererProps) {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstance = useRef<mapboxgl.Map | undefined>(undefined);
    const tooltip = useRef<mapboxgl.Popup | undefined>(undefined);
    const navigationControlButton = useRef<mapboxgl.NavigationControl | null>(null);
    const prevPropsRef = useRef<IGeoChartRendererProps | null>(null);

    // Set mapbox token on mount and when it changes
    useEffect(() => {
        mapboxgl.accessToken = config.mapboxToken;
    }, [config.mapboxToken]);

    const isViewportFrozen = useCallback((): boolean => {
        return config?.viewport?.frozen ?? false;
    }, [config]);

    const generateLocale = useCallback(() => {
        return {
            "ScrollZoomBlocker.CtrlMessage": intl.formatMessage(
                { id: "geochart.scroll.zoom.blocker" },
                { button: "ctrl" },
            ),
            "ScrollZoomBlocker.CmdMessage": intl.formatMessage(
                { id: "geochart.scroll.zoom.blocker" },
                { button: "⌘" },
            ),
            "TouchPanBlocker.Message": intl.formatMessage({ id: "geochart.touch.pan.blocker" }),
        };
    }, [intl]);

    const createTooltip = useCallback(() => {
        tooltip.current = new mapboxgl.Popup(DEFAULT_TOOLTIP_OPTIONS);
    }, []);

    const createMap = useCallback((): void => {
        const data = geoData.location!.data;
        const { isExportMode = false, cooperativeGestures = true } = config || {};
        const isViewportFrozenValue = isViewportFrozen();
        const locale = cooperativeGestures ? generateLocale() : {};
        const { zoom, center } = getViewportOptions(data, config);

        chartInstance.current = new mapboxgl.Map({
            ...DEFAULT_MAPBOX_OPTIONS,
            container: chartRef.current!,
            // If true, the map's canvas can be exported to a PNG using map.getCanvas().toDataURL().
            // This is false by default as a performance optimization.
            interactive: !isViewportFrozenValue,
            preserveDrawingBuffer: isExportMode,
            ...(center ? { center } : {}),
            ...(zoom ? { zoom } : {}),
            cooperativeGestures,
            locale,
        });
    }, [config, geoData, isViewportFrozen, generateLocale]);

    const removeLayer = useCallback((layerName: string): void => {
        if (!chartInstance.current) {
            return;
        }

        if (chartInstance.current.getLayer(layerName)) {
            chartInstance.current.removeLayer(layerName);
        }
    }, []);

    const cleanupMap = useCallback((): void => {
        if (!chartInstance.current) {
            return;
        }

        removeLayer(DEFAULT_LAYER_NAME);
        removeLayer(DEFAULT_CLUSTER_LAYER_NAME);
        removeLayer(DEFAULT_CLUSTER_LABELS_CONFIG.id);
        if (chartInstance.current.getSource(DEFAULT_DATA_SOURCE_NAME)) {
            chartInstance.current.removeSource(DEFAULT_DATA_SOURCE_NAME);
        }
    }, [removeLayer]);

    const removeMapControls = useCallback((): void => {
        if (navigationControlButton.current && chartInstance.current) {
            chartInstance.current.removeControl(navigationControlButton.current);
            navigationControlButton.current = null;
        }
    }, []);

    const addMapControls = useCallback((): void => {
        if (!navigationControlButton.current && chartInstance.current) {
            navigationControlButton.current = new mapboxgl.NavigationControl({
                showCompass: false,
            });
            chartInstance.current.addControl(navigationControlButton.current, "top-right");
        }
    }, []);

    const toggleMapControls = useCallback((): void => {
        const isViewportFrozenValue = isViewportFrozen();
        if (isViewportFrozenValue) {
            removeMapControls();
        } else {
            addMapControls();
        }
    }, [isViewportFrozen, addMapControls, removeMapControls]);

    const toggleInteractionEvents = useCallback((): void => {
        const isViewportFrozenValue = isViewportFrozen();
        const chart:
            | { [key in (typeof INTERACTION_EVENTS)[number]]?: { disable?: () => void; enable?: () => void } }
            | undefined = chartInstance.current;
        if (chart === undefined) {
            return;
        }

        const action = isViewportFrozenValue ? "disable" : "enable";
        try {
            INTERACTION_EVENTS.forEach((interactionEvent): void => chart[interactionEvent]?.[action]?.());
        } catch (e) {
            const { isExportMode = false } = config || {};
            const message = `GeoChart: toggle interaction events failed. Error: ${e}`;
            // put as console.error in export mode to get to the exporter logs
            if (isExportMode) {
                console.error(message);
            } else {
                console.warn(message);
            }
        }
    }, [config, isViewportFrozen]);

    const updatePanAndZoom = useCallback((): void => {
        toggleMapControls();
        toggleInteractionEvents();
    }, [toggleMapControls, toggleInteractionEvents]);

    const updateViewport = useCallback((): void => {
        invariant(chartInstance.current, "illegal state - updating viewport while map not initialized");

        const data = geoData.location!.data;
        const { bounds } = getViewportOptions(data, config);

        if (bounds) {
            try {
                chartInstance.current.fitBounds(bounds, DEFAULT_MAPBOX_OPTIONS.fitBoundsOptions);
            } catch {
                // sometimes fitBounds is called before this.chart.resize() takes all effects and map area is invisible/small which leads to error in mapbox division by 0 -> NaN. Next re-render will fix it.
            }
        }
    }, [config, geoData]);

    const setFilterMap = useCallback((): void => {
        invariant(chartInstance.current, "illegal state - setting filter while map not initialized");

        const { selectedSegmentItems = [] } = config;

        if (chartInstance.current!.getLayer(DEFAULT_LAYER_NAME)) {
            chartInstance.current!.setFilter(DEFAULT_LAYER_NAME, createPushpinFilter(selectedSegmentItems));
        }
    }, [config]);

    const createMapControls = useCallback(() => {
        invariant(chartInstance.current, "illegal state - creating map controls while map not initialized");

        const isViewportFrozenValue = isViewportFrozen();

        chartInstance.current!.addControl(
            new mapboxgl.AttributionControl({
                compact: true,
            }),
        );

        if (!isViewportFrozenValue) {
            addMapControls();
        }
    }, [isViewportFrozen, addMapControls]);

    const handleMapboxError = useCallback(() => {
        // Every Mapbox error is considered as invalid token error.
        // If we want to distinguish error types put some filtering here.
        onError?.(new GeoTokenMissingSdkError());
    }, [onError]);

    const handleMapClick = useCallback(
        (e: mapboxgl.EventData) => {
            const { viewport } = config;
            const { features, originalEvent } = e;
            const {
                geometry: { coordinates },
                properties,
            } = features[0];

            // Disable drilling in edit/export mode
            if (viewport?.frozen) {
                return;
            }

            return handleGeoPushpinDrillEvent(
                drillableItems,
                drillConfig,
                DataViewFacade.for(dataView),
                geoData,
                properties,
                coordinates,
                originalEvent.target,
            );
        },
        [config, drillableItems, drillConfig, dataView, geoData],
    );

    const handlePushpinMouseEnterCallback = useCallback(
        (e: mapboxgl.EventData) => {
            return handlePushpinMouseEnter(
                e,
                chartInstance.current!,
                tooltip.current!,
                config,
                drillableItems,
                intl,
            );
        },
        [config, drillableItems, intl],
    );

    const handlePushpinMouseLeaveCallback = useCallback(
        (e: mapboxgl.EventData) => {
            return handlePushpinMouseLeave(e, chartInstance.current!, tooltip.current!, config);
        },
        [config],
    );

    const handlePushpinMoveEnd = useCallback(
        (e: mapboxgl.EventData) => {
            const { target } = e;
            const { lng, lat } = target.getCenter();
            const center: IGeoLngLat = { lng, lat };
            onCenterPositionChanged(center);
        },
        [onCenterPositionChanged],
    );

    const handlePushpinZoomEnd = useCallback(
        (e: mapboxgl.EventData) => {
            const { target } = e;
            const zoom: number = target.getZoom();
            onZoomChanged(zoom);
        },
        [onZoomChanged],
    );

    const handleMapIdle = useCallback(() => {
        const chart = chartInstance.current;
        if (!chart) {
            return;
        }
        chart.off("idle", handleMapIdle);
        afterRender();
    }, [afterRender]);

    const adjustChartHeight = useCallback(() => {
        const chart = chartInstance.current;
        const chartRefCurrent = chartRef.current;

        if (!chartRefCurrent || !chart) {
            return;
        }

        const chartHeight: number = chartRefCurrent.clientHeight;
        const parentHeight: number = chartRefCurrent.parentElement?.clientHeight ?? 0;
        const shouldResize: boolean =
            chartHeight <= ZOOM_CONTROLS_HEIGHT && ZOOM_CONTROLS_HEIGHT <= parentHeight;

        if (shouldResize) {
            // set min height to re-position mapbox attribution and zoom control, in case there are too many top legend items
            // that take all visible height of widget and make geo chart container's height zero
            chartRefCurrent.style.minHeight = `${parentHeight}px`;
            chart.resize();
        }
    }, []);

    const setupMap = useCallback((): void => {
        const chart = chartInstance.current;

        invariant(chart, "illegal state - setting up map but with no existing map instance");

        const { points: { groupNearbyPoints = true } = {}, showLabels = true } = config || {};

        const hasClustering: boolean = isClusteringAllowed(geoData, groupNearbyPoints);
        const dataSourceProps: IGeoDataSourceProps = {
            colorStrategy,
            config,
            geoData,
            hasClustering,
        };
        chart.addSource(DEFAULT_DATA_SOURCE_NAME, createPushpinDataSource(dataSourceProps));

        if (hasClustering) {
            chart.addLayer(createClusterPoints(DEFAULT_DATA_SOURCE_NAME));
            chart.addLayer(createClusterLabels(DEFAULT_DATA_SOURCE_NAME));
            // un-clustered points will be rendered under state/county label
            chart.addLayer(createUnclusterPoints(DEFAULT_DATA_SOURCE_NAME), "state-label");
        } else {
            chart.addLayer(
                createPushpinDataLayer(DEFAULT_DATA_SOURCE_NAME, geoData, config),
                "state-label", // pushpin will be rendered under state/county label
            );
        }

        // that config is not public,
        // we only use for storybook to make it is more stable
        if (!showLabels) {
            const { layers = [] } = chart.getStyle();
            layers.forEach((layer: mapboxgl.Layer) => {
                if (layer.id.includes(LAYER_STYLE_LABEL_PREFIX)) {
                    removeLayer(layer.id);
                }
            });
        }

        // Define the handler inline to avoid ref timing issues
        const handleDataEvent = () => {
            if (!chart?.isStyleLoaded()) {
                return;
            }
            chart.off("data", handleDataEvent);
        };

        // keep listening to the data event until the style is loaded
        chart.on("data", handleDataEvent);
    }, [config, geoData, colorStrategy, removeLayer]);

    const handleMapEvent = useCallback(() => {
        const chart = chartInstance.current;

        invariant(chart, "illegal state - setting map event handlers while map not initialized");

        chart.on("click", DEFAULT_LAYER_NAME, handleMapClick);
        chart.on("idle", handleMapIdle);
        chart.on("load", setupMap);
        chart.on("load", adjustChartHeight);
        chart.on("mouseenter", DEFAULT_LAYER_NAME, handlePushpinMouseEnterCallback);
        chart.on("mouseleave", DEFAULT_LAYER_NAME, handlePushpinMouseLeaveCallback);
        chart.on("moveend", handlePushpinMoveEnd);
        chart.on("zoomend", handlePushpinZoomEnd);
        chart.on("error", handleMapboxError);
        chart.on("resize", updateViewport);
    }, [
        handleMapClick,
        handleMapIdle,
        setupMap,
        adjustChartHeight,
        handlePushpinMouseEnterCallback,
        handlePushpinMouseLeaveCallback,
        handlePushpinMoveEnd,
        handlePushpinZoomEnd,
        handleMapboxError,
        updateViewport,
    ]);

    const removeMapEvents = useCallback(() => {
        const chart = chartInstance.current;

        if (!chart) {
            return;
        }

        chart.off("click", DEFAULT_LAYER_NAME, handleMapClick);
        chart.off("idle", handleMapIdle);
        chart.off("load", setupMap);
        chart.off("load", adjustChartHeight);
        chart.off("mouseenter", DEFAULT_LAYER_NAME, handlePushpinMouseEnterCallback);
        chart.off("mouseleave", DEFAULT_LAYER_NAME, handlePushpinMouseLeaveCallback);
        chart.off("moveend", handlePushpinMoveEnd);
        chart.off("zoomend", handlePushpinZoomEnd);
        chart.off("error", handleMapboxError);
        chart.off("resize", updateViewport);
    }, [
        handleMapClick,
        handleMapIdle,
        setupMap,
        adjustChartHeight,
        handlePushpinMouseEnterCallback,
        handlePushpinMouseLeaveCallback,
        handlePushpinMoveEnd,
        handlePushpinZoomEnd,
        handleMapboxError,
        updateViewport,
    ]);

    const removeMap = useCallback((): void => {
        if (!chartInstance.current) {
            return;
        }

        // Remove event listeners before removing the map
        removeMapEvents();

        // try catch to hide the mapbox's error message
        // TypeError: Cannot read property 'off' of undefined
        // mapbox is trying to call its function after deleted
        // https://github.com/mapbox/mapbox-gl-js/blob/master/src/ui/control/navigation_control.js#L118
        try {
            chartInstance.current.remove();
        } catch {
            return;
        }
    }, [removeMapEvents]);

    const fullMapInit = useCallback((): void => {
        createTooltip();
        createMap();
        createMapControls();
        handleMapEvent();
        updateViewport();
    }, [createTooltip, createMap, createMapControls, handleMapEvent, updateViewport]);

    const resetMap = useCallback((): void => {
        cleanupMap();
        setupMap();
    }, [cleanupMap, setupMap]);

    const shouldResetMap = useCallback(
        (prevConfig: IGeoConfig, prevColorStrategy: IColorStrategy): boolean => {
            return (
                isPointsConfigChanged(prevConfig.points, config.points) ||
                isColorAssignmentItemChanged(
                    prevColorStrategy.getColorAssignment(),
                    colorStrategy.getColorAssignment(),
                )
            );
        },
        [config, colorStrategy],
    );

    const updateMapWithConfig = useCallback(
        (prevConfig: IGeoConfig, prevColorStrategy: IColorStrategy): void => {
            if (shouldResetMap(prevConfig, prevColorStrategy)) {
                // Config for clustering and pushpin size lead to change layer setting
                // Then calling resetMap here is needed
                resetMap();
            }

            updatePanAndZoom();
        },
        [shouldResetMap, resetMap, updatePanAndZoom],
    );

    // ComponentDidMount effect
    useEffect(() => {
        fullMapInit();
        return () => {
            removeMap();
        };
    }, [fullMapInit, removeMap]);

    // ComponentDidUpdate effect
    useEffect(() => {
        if (!prevPropsRef.current) {
            prevPropsRef.current = {
                config,
                drillableItems,
                drillConfig,
                dataView,
                geoData,
                colorStrategy,
                afterRender,
                onCenterPositionChanged,
                onZoomChanged,
                onError,
                intl,
            };
            return;
        }

        const prevProps = prevPropsRef.current;
        const { selectedSegmentItems } = config;
        const { config: prevConfig, colorStrategy: prevColorStrategy } = prevProps;
        const { selectedSegmentItems: prevSelectedSegmentItems = [] } = prevConfig || {};

        if (!chartInstance.current) {
            prevPropsRef.current = {
                config,
                drillableItems,
                drillConfig,
                dataView,
                geoData,
                colorStrategy,
                afterRender,
                onCenterPositionChanged,
                onZoomChanged,
                onError,
                intl,
            };
            return;
        }

        if (prevConfig.mapboxToken !== config.mapboxToken) {
            removeMap();
            mapboxgl.accessToken = config.mapboxToken;
            fullMapInit();
        }

        // resize map when component is updated
        // for example: toggle legend, change position of legend
        chartInstance.current.resize();

        // only update map when style is ready
        // work around for ticket SD-898
        // avoid refresh whole map will be fixed in ticket SD-899
        if (!chartInstance.current.isStyleLoaded()) {
            prevPropsRef.current = {
                config,
                drillableItems,
                drillConfig,
                dataView,
                geoData,
                colorStrategy,
                afterRender,
                onCenterPositionChanged,
                onZoomChanged,
                onError,
                intl,
            };
            return;
        }
        const isColorChanged = isColorAssignmentItemChanged(
            prevColorStrategy.getColorAssignment(),
            colorStrategy.getColorAssignment(),
        );
        const selectedSegmentItemsChanged =
            selectedSegmentItems && !isEqual(selectedSegmentItems, prevSelectedSegmentItems);
        if (!isColorChanged && selectedSegmentItemsChanged) {
            setFilterMap();
            prevPropsRef.current = {
                config,
                drillableItems,
                drillConfig,
                dataView,
                geoData,
                colorStrategy,
                afterRender,
                onCenterPositionChanged,
                onZoomChanged,
                onError,
                intl,
            };
            return;
        }

        updateMapWithConfig(prevConfig, prevColorStrategy);

        prevPropsRef.current = {
            config,
            drillableItems,
            drillConfig,
            dataView,
            geoData,
            colorStrategy,
            afterRender,
            onCenterPositionChanged,
            onZoomChanged,
            onError,
            intl,
        };
    });

    const { isExportMode = false } = config;
    const classNames = cx("s-gd-geo-chart-renderer", "mapbox-container", {
        isExportMode,
        "s-isExportMode": isExportMode,
    });

    return <div className={classNames} ref={chartRef} />;
}

export default GeoChartRenderer;
