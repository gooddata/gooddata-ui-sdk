// (C) 2007-2025 GoodData Corporation
import { useEffect, useRef, useCallback } from "react";
import cx from "classnames";
import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
import mapboxgl from "mapbox-gl";
import { invariant } from "ts-invariant";
import {
    createClusterLabels,
    createClusterPoints,
    createPushpinDataLayer,
    createUnclusterPoints,
    createPushpinFilter,
} from "./geoChartDataLayers.js";
import { createPushpinDataSource, IGeoDataSourceProps } from "./geoChartDataSource.js";
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
import { IGeoConfig, IGeoData, IGeoLngLat } from "../../GeoChart.js";

import { handlePushpinMouseEnter, handlePushpinMouseLeave } from "./geoChartTooltip.js";
import { getViewportOptions } from "./helpers/geoChart/viewport.js";
import {
    isClusteringAllowed,
    isPointsConfigChanged,
    isColorAssignmentItemChanged,
} from "./helpers/geoChart/common.js";
import {
    IDrillConfig,
    IHeaderPredicate,
    DataViewFacade,
    OnError,
    GeoTokenMissingSdkError,
} from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { handleGeoPushpinDrillEvent } from "./helpers/geoChart/drilling.js";

import { WrappedComponentProps } from "react-intl";

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

export default function GeoChartRenderer(props: IGeoChartRendererProps) {
    const {
        config = {
            mapboxToken: "",
        },
        afterRender = noop,
        onZoomChanged = noop,
        onCenterPositionChanged = noop,
        drillableItems,
        drillConfig,
        dataView,
        geoData,
        colorStrategy,
        onError,
        intl,
    } = props;

    const chartRef = useRef<mapboxgl.Map | undefined>(undefined);
    const tooltipRef = useRef<mapboxgl.Popup | undefined>(undefined);
    const navigationControlButtonRef = useRef<mapboxgl.NavigationControl | null>(null);
    const chartElementRef = useRef<HTMLElement | null>(null);

    const setChartRef = useCallback((ref: HTMLElement | null): void => {
        chartElementRef.current = ref;
    }, []);

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

    const isViewportFrozen = useCallback((): boolean => {
        return config?.viewport?.frozen ?? false;
    }, [config]);

    const createTooltip = useCallback(() => {
        tooltipRef.current = new mapboxgl.Popup(DEFAULT_TOOLTIP_OPTIONS);
    }, []);

    const createMap = useCallback((): void => {
        const data = geoData.location!.data;
        const { isExportMode = false, cooperativeGestures = true } = config || {};
        const isViewportFrozenValue = isViewportFrozen();
        const locale = cooperativeGestures ? generateLocale() : {};
        const { zoom, center } = getViewportOptions(data, config);

        chartRef.current = new mapboxgl.Map({
            ...DEFAULT_MAPBOX_OPTIONS,
            container: chartElementRef.current!,
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

    const removeMapControls = useCallback((): void => {
        if (navigationControlButtonRef.current) {
            chartRef.current!.removeControl(navigationControlButtonRef.current);
            navigationControlButtonRef.current = null;
        }
    }, []);

    const addMapControls = useCallback((): void => {
        if (!navigationControlButtonRef.current) {
            navigationControlButtonRef.current = new mapboxgl.NavigationControl({
                showCompass: false,
            });
            chartRef.current!.addControl(navigationControlButtonRef.current, "top-right");
        }
    }, []);

    const toggleMapControls = useCallback((): void => {
        const isViewportFrozenValue = isViewportFrozen();
        if (!isViewportFrozenValue) {
            addMapControls();
        } else {
            removeMapControls();
        }
    }, [isViewportFrozen, addMapControls, removeMapControls]);

    const toggleInteractionEvents = useCallback((): void => {
        const isViewportFrozenValue = isViewportFrozen();
        const chart:
            | { [key in (typeof INTERACTION_EVENTS)[number]]?: { disable?: () => void; enable?: () => void } }
            | undefined = chartRef.current;
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
        invariant(chartRef.current, "illegal state - updating viewport while map not initialized");

        const data = geoData.location!.data;
        const { bounds } = getViewportOptions(data, config);

        if (bounds) {
            try {
                chartRef.current.fitBounds(bounds, DEFAULT_MAPBOX_OPTIONS.fitBoundsOptions);
            } catch {
                // sometimes fitBounds is called before this.chart.resize() takes all effects and map area is invisible/small which leads to error in mapbox division by 0 -> NaN. Next re-render will fix it.
            }
        }
    }, [config, geoData]);

    const createMapControls = useCallback(() => {
        invariant(chartRef.current, "illegal state - creating map controls while map not initialized");

        const isViewportFrozenValue = isViewportFrozen();

        chartRef.current!.addControl(
            new mapboxgl.AttributionControl({
                compact: true,
            }),
        );

        if (!isViewportFrozenValue) {
            addMapControls();
        }
    }, [isViewportFrozen, addMapControls]);

    const setFilterMap = useCallback((): void => {
        invariant(chartRef.current, "illegal state - setting filter while map not initialized");

        const { selectedSegmentItems = [] } = config;

        if (chartRef.current!.getLayer(DEFAULT_LAYER_NAME)) {
            chartRef.current!.setFilter(DEFAULT_LAYER_NAME, createPushpinFilter(selectedSegmentItems));
        }
    }, [config]);

    const handlePushpinMoveEnd = useCallback(
        (e: mapboxgl.EventData): void => {
            const { target } = e;
            const { lng, lat } = target.getCenter();
            const center: IGeoLngLat = { lng, lat };
            onCenterPositionChanged(center);
        },
        [onCenterPositionChanged],
    );

    const handlePushpinZoomEnd = useCallback(
        (e: mapboxgl.EventData): void => {
            const { target } = e;
            const zoom: number = target.getZoom();

            onZoomChanged(zoom);
        },
        [onZoomChanged],
    );

    const handleMapboxError = useCallback((): void => {
        // Every Mapbox error is considered as invalid token error.
        // If we want to distinguish error types put some filtering here.
        onError?.(new GeoTokenMissingSdkError());
    }, [onError]);

    const handleMapClick = useCallback(
        (e: mapboxgl.EventData): void => {
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
        (e: mapboxgl.EventData): void => {
            const chart = chartRef.current;
            const tooltip = tooltipRef.current;
            return handlePushpinMouseEnter(e, chart!, tooltip!, config, drillableItems, intl);
        },
        [config, drillableItems, intl],
    );

    const handlePushpinMouseLeaveCallback = useCallback(
        (e: mapboxgl.EventData): void => {
            const chart = chartRef.current;
            const tooltip = tooltipRef.current;
            return handlePushpinMouseLeave(e, chart!, tooltip!, config);
        },
        [config],
    );

    /*
    Fired after the last frame rendered before the map enters an "idle" state:
        - No camera transitions are in progress
        - All currently requested tiles have loaded
        - All fade/transition animations have completed
    This is called one time only
    */
    const handleMapIdle = useCallback((): void => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }
        afterRender();
    }, [afterRender]);

    const removeLayer = useCallback((layerName: string): void => {
        if (!chartRef.current) {
            return;
        }

        if (chartRef.current.getLayer(layerName)) {
            chartRef.current.removeLayer(layerName);
        }
    }, []);

    const handleLayerLoaded = useCallback((): void => {
        const chart = chartRef.current;

        if (!chart?.isStyleLoaded()) {
            return;
        }
    }, []);

    const adjustChartHeight = useCallback(() => {
        const chart = chartRef.current;
        const chartElement = chartElementRef.current;

        if (!chartElement || !chart) {
            return;
        }

        const chartHeight: number = chartElement.clientHeight;
        const parentHeight: number = chartElement.parentElement?.clientHeight ?? 0;
        const shouldResize: boolean =
            chartHeight <= ZOOM_CONTROLS_HEIGHT && ZOOM_CONTROLS_HEIGHT <= parentHeight;

        if (shouldResize) {
            // set min height to re-position mapbox attribution and zoom control, in case there are too many top legend items
            // that take all visible height of widget and make geo chart container's height zero
            chartElement.style.minHeight = `${parentHeight}px`;
            chart.resize();
        }
    }, []);

    const setupMap = useCallback((): void => {
        const chart = chartRef.current;

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

        if (!hasClustering) {
            chart.addLayer(
                createPushpinDataLayer(DEFAULT_DATA_SOURCE_NAME, geoData, config),
                "state-label", // pushpin will be rendered under state/county label
            );
        } else {
            chart.addLayer(createClusterPoints(DEFAULT_DATA_SOURCE_NAME));
            chart.addLayer(createClusterLabels(DEFAULT_DATA_SOURCE_NAME));
            // un-clustered points will be rendered under state/county label
            chart.addLayer(createUnclusterPoints(DEFAULT_DATA_SOURCE_NAME), "state-label");
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

        // keep listening to the data event until the style is loaded
        chart.on("data", handleLayerLoaded);
    }, [config, geoData, colorStrategy, removeLayer, handleLayerLoaded]);

    const handleMapEvent = useCallback(() => {
        const chart = chartRef.current;

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

    const cleanupMap = useCallback((): void => {
        if (!chartRef.current) {
            return;
        }

        removeLayer(DEFAULT_LAYER_NAME);
        removeLayer(DEFAULT_CLUSTER_LAYER_NAME);
        removeLayer(DEFAULT_CLUSTER_LABELS_CONFIG.id);
        if (chartRef.current.getSource(DEFAULT_DATA_SOURCE_NAME)) {
            chartRef.current.removeSource(DEFAULT_DATA_SOURCE_NAME);
        }
    }, [removeLayer]);

    const resetMap = useCallback((): void => {
        cleanupMap();
        setupMap();
    }, [cleanupMap, setupMap]);

    const removeMap = useCallback((): void => {
        if (!chartRef.current) {
            return;
        }
        // try catch to hide the mapbox's error message
        // TypeError: Cannot read property 'off' of undefined
        // mapbox is trying to call its function after deleted
        // https://github.com/mapbox/mapbox-gl-js/blob/master/src/ui/control/navigation_control.js#L118
        try {
            chartRef.current.remove();
        } catch {
            return;
        }
    }, []);

    const fullMapInit = useCallback((): void => {
        createTooltip();
        createMap();
        createMapControls();
        handleMapEvent();
        updateViewport();
    }, [createTooltip, createMap, createMapControls, handleMapEvent, updateViewport]);

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

    // componentDidMount equivalent
    useEffect(() => {
        mapboxgl.accessToken = config.mapboxToken;
        fullMapInit();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // componentWillUnmount equivalent
    useEffect(() => {
        return () => {
            removeMap();
        };
    }, [removeMap]);

    // componentDidUpdate equivalent
    useEffect(() => {
        if (!chartRef.current) {
            return;
        }

        // resize map when component is updated
        // for example: toggle legend, change position of legend
        chartRef.current.resize();

        // only update map when style is ready
        // work around for ticket SD-898
        // avoid refresh whole map will be fixed in ticket SD-899
        if (!chartRef.current.isStyleLoaded()) {
            return;
        }
    }, [
        config,
        geoData,
        colorStrategy,
        drillableItems,
        drillConfig,
        dataView,
        afterRender,
        onCenterPositionChanged,
        onZoomChanged,
        onError,
        intl,
    ]);

    // Handle mapbox token change
    const prevConfigRef = useRef<IGeoConfig>(undefined);
    const prevColorStrategyRef = useRef<IColorStrategy>(undefined);
    useEffect(() => {
        if (prevConfigRef.current && prevConfigRef.current.mapboxToken !== config.mapboxToken) {
            removeMap();
            mapboxgl.accessToken = config.mapboxToken;
            fullMapInit();
        }
        prevConfigRef.current = config;
    }, [config, removeMap, fullMapInit]);

    // Handle other config changes
    useEffect(() => {
        if (!chartRef.current || !prevConfigRef.current || !prevColorStrategyRef.current) {
            prevConfigRef.current = config;
            prevColorStrategyRef.current = colorStrategy;
            return;
        }

        if (!chartRef.current.isStyleLoaded()) {
            return;
        }

        const { selectedSegmentItems } = config;
        const { selectedSegmentItems: prevSelectedSegmentItems = [] } = prevConfigRef.current || {};

        const isColorChanged = isColorAssignmentItemChanged(
            prevColorStrategyRef.current.getColorAssignment(),
            colorStrategy.getColorAssignment(),
        );
        const selectedSegmentItemsChanged =
            selectedSegmentItems && !isEqual(selectedSegmentItems, prevSelectedSegmentItems);

        if (!isColorChanged && selectedSegmentItemsChanged) {
            setFilterMap();
        } else {
            updateMapWithConfig(prevConfigRef.current, prevColorStrategyRef.current);
        }

        prevConfigRef.current = config;
        prevColorStrategyRef.current = colorStrategy;
    }, [config, colorStrategy, setFilterMap, updateMapWithConfig]);

    const classNames = cx("s-gd-geo-chart-renderer", "mapbox-container", {
        isExportMode: config.isExportMode,
        "s-isExportMode": config.isExportMode,
    });

    return <div className={classNames} ref={setChartRef} />;
}
