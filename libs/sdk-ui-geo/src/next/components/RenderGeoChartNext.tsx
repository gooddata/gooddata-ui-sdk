// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import ReactMeasure, { type ContentRect, type MeasuredComponentProps } from "react-measure";
import { v4 } from "uuid";

import {
    type ITranslationsComponentProps,
    IntlTranslationsProvider,
    convertDrillableItemsToPredicates,
} from "@gooddata/sdk-ui";

import { GeoChartNextLegendOverlay } from "./multiLayerLegend/GeoChartNextLegendOverlay.js";
import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";
import { useGeoLayers } from "../context/GeoLayersContext.js";
import { MapController } from "../map/MapController.js";
import { computeCombinedViewport, computeViewportFromConfig } from "../map/viewport.js";
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
    const { layers, layerExecutions, colorPalette, primaryLayer } = useGeoLayers();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const containerId = useMemo(() => `${containerBaseId}-${v4()}`, []);

    const [chartContainerRect, setChartContainerRect] = useState<ContentRect | null>(null);

    const colorStrategy = primaryLayer?.colorStrategy ?? null;
    const availableLegends = primaryLayer?.availableLegends;

    const dataViewport = useMemo(() => computeCombinedViewport(layers), [layers]);
    const initialViewport = useMemo(
        () => computeViewportFromConfig(props.config, dataViewport),
        [props.config, dataViewport],
    );

    const drillablePredicates = useMemo(
        () => convertDrillableItemsToPredicates(props.drillableItems ?? []),
        [props.drillableItems],
    );

    const isExportMode = props.config?.isExportMode ?? false;
    const containerClass = cx(
        "gd-geo-chart-next__container",
        "gd-geo-component",
        containerBaseId,
        containerId,
        {
            isExportMode,
        },
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
                    <div ref={mapContainerRef} className="gd-geo-chart-next__map">
                        <IntlTranslationsProvider>
                            {(translationProps: ITranslationsComponentProps) => (
                                <GeoChartNextLegendOverlay
                                    config={props.config}
                                    chartContainerRect={chartContainerRect}
                                    layers={layers}
                                    layerExecutions={layerExecutions}
                                    primaryLayer={primaryLayer}
                                    numericSymbols={translationProps.numericSymbols}
                                />
                            )}
                        </IntlTranslationsProvider>
                    </div>
                    <MapController
                        mapContainerRef={mapContainerRef}
                        chartContainerRect={chartContainerRect}
                        initialViewport={initialViewport}
                        dataViewport={dataViewport}
                        layerExecutions={layerExecutions}
                        drillablePredicates={drillablePredicates}
                        onCenterPositionChanged={props.onCenterPositionChanged}
                        onZoomChanged={props.onZoomChanged}
                        onDrill={props.onDrill}
                        afterRender={props.afterRender}
                        config={props.config}
                        backend={props.backend}
                    />
                    <PushDataSync
                        colorStrategy={colorStrategy}
                        colorPalette={colorPalette}
                        availableLegends={availableLegends}
                        geoLayerType={props.type}
                    />
                </div>
            )}
        </Measure>
    );
}
