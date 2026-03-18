// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import { useIntl } from "react-intl";
import ReactMeasure, { type ContentRect, type MeasuredComponentProps } from "react-measure";
import { v4 } from "uuid";

import {
    type GoodDataSdkError,
    type ITranslationsComponentProps,
    IntlTranslationsProvider,
    convertDrillableItemsToPredicates,
} from "@gooddata/sdk-ui";

import { GeoChartLegendOverlay } from "./multiLayerLegend/GeoChartLegendOverlay.js";
import { type LegendMessageFormatter, legendMessagesById } from "./multiLayerLegend/legendMessages.js";
import { useGeoChartProps } from "../context/GeoChartContext.js";
import { useGeoLayers } from "../context/GeoLayersContext.js";
import { MapController } from "../map/MapController.js";
import { computeViewportFromConfig } from "../map/viewport/viewportResolution.js";
import { computeCombinedViewport } from "../map/viewport.js";
import { PushDataSync } from "../pushData/PushDataSync.js";
import {
    getMapCanvasInstructionMessageId,
    getMapCanvasRuntimeCapabilities,
    mapCanvasInstructionMessagesById,
} from "../utils/mapCanvasAccessibility.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
const Measure = defaultImport(ReactMeasure);

const containerBaseId = "geo-chart-next";

/**
 * Rendering component for GeoChart.
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
interface IRenderGeoChartProps {
    onMapError?: (error: GoodDataSdkError | null) => void;
}

export function RenderGeoChart({ onMapError }: IRenderGeoChartProps): ReactElement {
    const props = useGeoChartProps();
    const intl = useIntl();
    const { layers, layerExecutions, primaryLayer } = useGeoLayers();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const legendPanelRef = useRef<HTMLDivElement>(null);
    const containerId = useMemo(() => `${containerBaseId}-${v4()}`, []);
    const isGeoChartA11yImprovementsEnabled = props.config?.enableGeoChartA11yImprovements ?? false;
    const mapInstructionsId = useMemo(
        () => (isGeoChartA11yImprovementsEnabled ? `${containerBaseId}-instructions-${v4()}` : undefined),
        [isGeoChartA11yImprovementsEnabled],
    );

    const mapCanvasCapabilities = useMemo(
        () => (isGeoChartA11yImprovementsEnabled ? getMapCanvasRuntimeCapabilities(props.config) : undefined),
        [isGeoChartA11yImprovementsEnabled, props.config],
    );
    const instructionMessage = useMemo(() => {
        if (!mapCanvasCapabilities) {
            return "";
        }

        const instructionMessageId = getMapCanvasInstructionMessageId(mapCanvasCapabilities);
        return intl.formatMessage(mapCanvasInstructionMessagesById[instructionMessageId]);
    }, [mapCanvasCapabilities, intl]);
    const mapCanvasTitle = isGeoChartA11yImprovementsEnabled ? props.config?.a11yTitle : undefined;
    const legendMessageFormatter = useCallback<LegendMessageFormatter>(
        (id, values) => {
            return intl.formatMessage(legendMessagesById[id], values);
        },
        [intl],
    );

    const [chartContainerRect, setChartContainerRect] = useState<ContentRect | null>(null);

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
                                <GeoChartLegendOverlay
                                    config={props.config}
                                    chartContainerRect={chartContainerRect}
                                    layers={layers}
                                    layerExecutions={layerExecutions}
                                    primaryLayer={primaryLayer}
                                    numericSymbols={translationProps.numericSymbols}
                                    formatMessage={legendMessageFormatter}
                                    setLegendPanelElementRef={(element) => {
                                        legendPanelRef.current = element;
                                    }}
                                />
                            )}
                        </IntlTranslationsProvider>
                    </div>
                    {isGeoChartA11yImprovementsEnabled && mapInstructionsId ? (
                        <p id={mapInstructionsId} className="sr-only">
                            {instructionMessage}
                        </p>
                    ) : null}
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
                        locale={props.locale}
                        mapInstructionsId={mapInstructionsId}
                        mapCanvasTitle={mapCanvasTitle}
                        legendPanelRef={legendPanelRef}
                        onMapError={onMapError}
                    />
                    <PushDataSync availableLegends={availableLegends} geoLayerType={props.type} />
                </div>
            )}
        </Measure>
    );
}
