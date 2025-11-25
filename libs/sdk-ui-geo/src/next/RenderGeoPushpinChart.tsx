// (C) 2025 GoodData Corporation

import { ReactElement, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import { useIntl } from "react-intl";
import ReactMeasure, { ContentRect, MeasuredComponentProps } from "react-measure";
import { v4 } from "uuid";

import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";

import { Legend } from "./components/legends/Legend.js";
import { useGeoData } from "./context/GeoDataContext.js";
import { useGeoPushpinProps } from "./context/GeoPushpinPropsContext.js";
import { useInitialExecution } from "./context/InitialExecutionContext.js";
import { calculateViewport } from "./features/map/viewportManagement.js";
import { useLegendConfig } from "./hooks/legend/useLegendConfig.js";
import { useLegendDetails } from "./hooks/legend/useLegendDetails.js";
import { useLegendItemsWithState } from "./hooks/legend/useLegendItemsWithState.js";
import { useSelectedSegments } from "./hooks/legend/useSelectedSegments.js";
import { useAfterRender } from "./hooks/map/useAfterRender.js";
import { useMapCallbacks } from "./hooks/map/useMapCallbacks.js";
import { getValidLocations, useMapDataSync } from "./hooks/map/useMapDataSync.js";
import { useMapInitialization } from "./hooks/map/useMapInitialization.js";
import { useMapResize } from "./hooks/map/useMapResize.js";
import { useTooltipHandlers } from "./hooks/map/useTooltipHandlers.js";
import { usePushData } from "./hooks/shared/usePushData.js";
import { IPushpinGeoData } from "./types/shared.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(ReactMeasure);

const containerBaseId = "geo-pushpin-chart-next";
/**
 * Rendering layer - displays the map
 *
 * @remarks
 * This is the final rendering layer that:
 * - Creates the map container
 * - Initializes the map
 * - Syncs data to the map
 * - Handles map interactions
 *
 * @internal
 */
export function RenderGeoPushpinChart(): ReactElement {
    const intl = useIntl();
    const props = useGeoPushpinProps();
    const { initialDataView } = useInitialExecution();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const containerId = useMemo(() => `${containerBaseId}-${v4()}`, []);

    // Track chart container dimensions for legend responsive behavior
    const [chartContainerRect, setChartContainerRect] = useState<ContentRect | null>(null);

    // Get all computed data from context (no transformations needed here)
    const { geoData, colorStrategy, baseLegendItems, colorPalette } = useGeoData<IPushpinGeoData>();

    // Calculate viewport from data
    // This is used for initial map setup and for updating viewport on resize
    const viewport = useMemo(() => {
        if (!geoData?.location?.data || !props.config) {
            return null;
        }
        const validLocations = getValidLocations(geoData.location.data);
        if (validLocations.length === 0) {
            return null;
        }
        return calculateViewport(validLocations, props.config);
    }, [geoData?.location?.data, props.config]);

    // Initialize map with pre-calculated viewport
    const { map, tooltip, isMapReady } = useMapInitialization(mapContainerRef, intl, props.config, viewport);

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

    // Sync data to map
    useMapDataSync(map, geoData, configWithSegments, colorStrategy, isMapReady, initialDataView);

    // Handle container resize
    useMapResize(map, isMapReady, chartContainerRect, viewport);

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
    useTooltipHandlers(map, tooltip, props.config, drillablePredicates, intl);

    // Call afterRender and onLoadingChanged when map finishes rendering
    useAfterRender(map, props.afterRender, props.execution);

    // Push data to analytical designer for configuration panel
    usePushData(colorStrategy, colorPalette);

    // Get legend configuration
    const legendConfig = useLegendConfig(props.config);

    // Compute legend details to get the actual position (may differ from config due to responsive behavior)
    // This ensures container layout and legend rendering use the same position
    const legendDetails = useLegendDetails(props.config, geoData, chartContainerRect ?? undefined);
    const position = legendDetails?.position ?? legendConfig.position;

    // Determine if legend should be rendered first (top or left position)
    const isLegendRenderedFirst = position === "top" || position === "left";

    // Container class based on legend position
    // Include gd-geo-component for legacy legend CSS support
    const isRow = position === "left" || position === "right";
    const flexDirection = isRow ? "flex-direction-row" : "flex-direction-column";
    const isExportMode = props.config?.isExportMode ?? false;
    const containerClass = cx(
        "gd-geo-pushpin-next__container",
        "gd-geo-component",
        containerBaseId,
        containerId,
        flexDirection,
        isRow ? "gd-geo-pushpin-next__container--flex-row" : "gd-geo-pushpin-next__container--flex-column",
        {
            isExportMode,
        },
    );

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
                    data-testid={isExportMode ? "geo-pushpin-chart-next-export-mode" : containerBaseId}
                    className={containerClass}
                    ref={measureRef}
                >
                    {isLegendRenderedFirst ? legendComponent : null}
                    <div ref={mapContainerRef} className="gd-geo-pushpin-next__map" />
                    {isLegendRenderedFirst ? null : legendComponent}
                </div>
            )}
        </Measure>
    );
}
