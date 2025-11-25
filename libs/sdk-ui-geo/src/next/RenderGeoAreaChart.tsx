// (C) 2025 GoodData Corporation

import { ReactElement, useMemo, useRef, useState } from "react";

import { defaultImport } from "default-import";
import { useIntl } from "react-intl";
import ReactMeasure, { ContentRect, MeasuredComponentProps } from "react-measure";
import { v4 } from "uuid";

import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";

import { Legend } from "./components/legends/Legend.js";
import { useGeoAreaCollection } from "./context/GeoAreaCollectionContext.js";
import { useGeoAreaData } from "./context/GeoAreaDataContext.js";
import { useGeoAreaProps } from "./context/GeoAreaPropsContext.js";
import { useInitialExecution } from "./context/InitialExecutionContext.js";
import { bboxToViewport } from "./features/map/viewportManagement.js";
import { useLegendConfig } from "./hooks/legend/useLegendConfig.js";
import { useLegendItemsWithState } from "./hooks/legend/useLegendItemsWithState.js";
import { useSelectedSegments } from "./hooks/legend/useSelectedSegments.js";
import { useAfterRender } from "./hooks/map/useAfterRender.js";
import { useAreaMapDataSync } from "./hooks/map/useAreaMapDataSync.js";
import { useMapCallbacks } from "./hooks/map/useMapCallbacks.js";
import { useMapInitialization } from "./hooks/map/useMapInitialization.js";
import { useMapResize } from "./hooks/map/useMapResize.js";
import { useTooltipHandlers } from "./hooks/map/useTooltipHandlers.js";
import { useAreaPushData } from "./hooks/shared/useAreaPushData.js";
import { DEFAULT_AREA_LAYER_NAME } from "./providers/maplibre/maplibreDataLayersArea.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

const containerBaseId = "geo-area-chart";

/**
 * Rendering layer - displays the area map
 *
 * @remarks
 * This is the final rendering layer that:
 * - Creates the map container
 * - Initializes the map
 * - Syncs area data to the map
 * - Handles map interactions
 *
 * @internal
 */
export function RenderGeoAreaChart(): ReactElement {
    const intl = useIntl();
    const props = useGeoAreaProps();
    const { initialDataView } = useInitialExecution();
    const collection = useGeoAreaCollection();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const containerId = useMemo(() => `${containerBaseId}-${v4()}`, []);

    // Track chart container dimensions for legend responsive behavior
    const [chartContainerRect, setChartContainerRect] = useState<ContentRect | null>(null);

    // Get all computed data from context (no transformations needed here)
    const { geoData, colorStrategy, baseLegendItems, colorPalette } = useGeoAreaData();

    const shouldUseCollectionViewport = useMemo(() => {
        if (props.config?.center) {
            return false;
        }

        if (props.config?.viewport?.area) {
            return false;
        }

        return Boolean(collection.bbox);
    }, [collection.bbox, props.config?.center, props.config?.viewport?.area]);

    const collectionViewport = useMemo(
        () => (shouldUseCollectionViewport ? bboxToViewport(collection.bbox) : null),
        [collection.bbox, shouldUseCollectionViewport],
    );

    // Initialize map with geo collection viewport when available
    const { map, tooltip, isMapReady } = useMapInitialization(
        mapContainerRef,
        intl,
        props.config,
        collectionViewport,
    );

    // Handle container resize similar to pushpin chart
    useMapResize(map, isMapReady, chartContainerRect, collectionViewport);

    // Merge base items with visibility state from context
    const legendItems = useLegendItemsWithState(baseLegendItems);

    // Get selected segments for filtering (use items with state)
    const selectedSegmentItems = useSelectedSegments(legendItems);

    // Create config with selected segments for filtering
    const configWithSegments = useMemo(
        () => ({
            ...props.config,
            selectedSegmentItems,
        }),
        [props.config, selectedSegmentItems],
    );

    // Sync area data to map
    useAreaMapDataSync(
        map,
        geoData,
        configWithSegments,
        colorStrategy,
        isMapReady,
        initialDataView,
        collection,
        collectionViewport,
    );

    // Set up map interaction callbacks
    useMapCallbacks(map, {
        onCenterPositionChanged: props.onCenterPositionChanged,
        onZoomChanged: props.onZoomChanged,
    });

    const drillablePredicates = useMemo(
        () => convertDrillableItemsToPredicates(props.drillableItems ?? []),
        [props.drillableItems],
    );

    // Set up tooltip handlers
    useTooltipHandlers(map, tooltip, props.config, drillablePredicates, intl, DEFAULT_AREA_LAYER_NAME);

    // Call afterRender and onLoadingChanged when map finishes rendering
    useAfterRender(map, props.afterRender, props.execution);

    // Push data to analytical designer for configuration panel
    useAreaPushData(colorStrategy, colorPalette);

    // Get legend configuration
    const legendConfig = useLegendConfig(props.config);
    const { position } = legendConfig;

    // Determine if legend should be rendered first (top or left position)
    const isLegendRenderedFirst = position === "top" || position === "left";

    // Container class based on legend position
    // Include gd-geo-component for legacy legend CSS support
    const isRow = position === "left" || position === "right";
    const flexDirection = isRow ? "flex-direction-row" : "flex-direction-column";
    const containerClass = `gd-geo-area-next__container gd-geo-component ${flexDirection} ${isRow ? "gd-geo-area-next__container--flex-row" : "gd-geo-area-next__container--flex-column"}`;

    const legendComponent = (
        <Legend
            colorStrategy={colorStrategy}
            config={props.config}
            categoryItems={legendItems}
            containerId={containerId}
            chartContainerRect={chartContainerRect ?? undefined}
        />
    );

    return (
        <Measure client onResize={setChartContainerRect}>
            {({ measureRef }: MeasuredComponentProps) => (
                <div
                    id={containerId}
                    data-testid="geo-area-chart"
                    className={containerClass}
                    ref={measureRef}
                >
                    {isLegendRenderedFirst ? legendComponent : null}
                    <div ref={mapContainerRef} className="gd-geo-area-next__map" />
                    {isLegendRenderedFirst ? null : legendComponent}
                </div>
            )}
        </Measure>
    );
}
