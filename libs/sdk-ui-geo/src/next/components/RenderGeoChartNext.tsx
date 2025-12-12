// (C) 2025 GoodData Corporation

import { type ReactElement, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import ReactMeasure, { type ContentRect, type MeasuredComponentProps } from "react-measure";
import { v4 } from "uuid";

import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";

import { Legend } from "./legends/Legend.js";
import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";
import { useGeoLayers } from "../context/GeoLayersContext.js";
import { useLegendRenderState } from "../hooks/legend/useLegendRenderState.js";
import { MapController } from "../map/MapController.js";
import { computeCombinedViewport } from "../map/viewport.js";
import { PushDataSync } from "../pushData/PushDataSync.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
const Measure = defaultImport(ReactMeasure);

const containerBaseId = "geo-chart-next";

/**
 * Rendering component for GeoChartNext
 *
 * @remarks
 * This is the final rendering layer that:
 * - Creates the map container
 * - Initializes the map
 * - Syncs all layers to map via useLayerRendering hook
 * - Handles map interactions
 * - Shows legend from primary layer
 *
 * All data is pre-loaded before this component renders - no async operations here.
 *
 * @internal
 */
export function RenderGeoChartNext(): ReactElement {
    const props = useGeoChartNextProps();
    const { layers, layerExecutions, colorPalette } = useGeoLayers();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const containerId = useMemo(() => `${containerBaseId}-${v4()}`, []);

    const [chartContainerRect, setChartContainerRect] = useState<ContentRect | null>(null);

    const { primaryLayer, colorStrategy, legendItems, selectedSegmentItems, isLegendRenderedFirst, isRow } =
        useLegendRenderState(props.config, chartContainerRect);

    const initialViewport = useMemo(() => computeCombinedViewport(layers), [layers]);

    const drillablePredicates = useMemo(
        () => convertDrillableItemsToPredicates(props.drillableItems ?? []),
        [props.drillableItems],
    );

    const flexDirection = isRow ? "flex-direction-row" : "flex-direction-column";
    const isExportMode = props.config?.isExportMode ?? false;
    const containerClass = cx(
        "gd-geo-chart-next__container",
        "gd-geo-component",
        containerBaseId,
        containerId,
        flexDirection,
        isRow ? "gd-geo-chart-next__container--flex-row" : "gd-geo-chart-next__container--flex-column",
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
                    data-testid={isExportMode ? "geo-chart-next-export-mode" : containerBaseId}
                    className={containerClass}
                    ref={measureRef}
                >
                    {isLegendRenderedFirst ? legendComponent : null}
                    <div ref={mapContainerRef} className="gd-geo-chart-next__map" />
                    {isLegendRenderedFirst ? null : legendComponent}
                    <MapController
                        mapContainerRef={mapContainerRef}
                        chartContainerRect={chartContainerRect}
                        initialViewport={initialViewport}
                        layerExecutions={layerExecutions}
                        selectedSegmentItems={selectedSegmentItems}
                        drillablePredicates={drillablePredicates}
                        onCenterPositionChanged={props.onCenterPositionChanged}
                        onZoomChanged={props.onZoomChanged}
                        afterRender={props.afterRender}
                        config={props.config}
                        backend={props.backend}
                    />
                    <PushDataSync
                        colorStrategy={colorStrategy}
                        colorPalette={colorPalette}
                        availableLegends={primaryLayer?.availableLegends}
                    />
                </div>
            )}
        </Measure>
    );
}
