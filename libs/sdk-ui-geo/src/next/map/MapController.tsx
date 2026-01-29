// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type RefObject, useMemo } from "react";

import { type ContentRect } from "react-measure";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IHeaderPredicate, type OnFiredDrillEvent, useBackend } from "@gooddata/sdk-ui";

import { MapRuntimeProvider, useMapRuntime } from "../context/MapRuntimeContext.js";
import { useGeoAdapterContext } from "../hooks/layers/useGeoAdapterContext.js";
import { useSyncLayersToMap } from "../hooks/layers/useSyncLayersToMap.js";
import { useAfterRender } from "../hooks/map/useAfterRender.js";
import { useApplyViewportOnConfigChange } from "../hooks/map/useApplyViewportOnConfigChange.js";
import { useMapCallbacks } from "../hooks/map/useMapCallbacks.js";
import { useMapInitialization } from "../hooks/map/useMapInitialization.js";
import { useMapResize } from "../hooks/map/useMapResize.js";
import { type CenterPositionChangedCallback, type ZoomChangedCallback } from "../types/common/callbacks.js";
import { type IGeoChartConfig } from "../types/config/unified.js";
import { type IMapViewport } from "../types/map/provider.js";
import { type ILayerExecutionRecord } from "../types/props/geoChart/internal.js";

export type MapControllerProps = {
    mapContainerRef: RefObject<HTMLDivElement | null>;
    chartContainerRect: ContentRect | null;
    initialViewport: Partial<IMapViewport> | null;
    dataViewport: Partial<IMapViewport> | null;
    layerExecutions: ILayerExecutionRecord[];
    drillablePredicates: IHeaderPredicate[];
    onCenterPositionChanged?: CenterPositionChangedCallback;
    onZoomChanged?: ZoomChangedCallback;
    onDrill?: OnFiredDrillEvent;
    afterRender?: () => void;
    config: IGeoChartConfig | undefined;
    backend?: IAnalyticalBackend;
};

/**
 * Centralized map controller that wires up map initialization, resize handling,
 * interaction callbacks, layer synchronization, and after-render signalling.
 */
export function MapController({
    mapContainerRef,
    chartContainerRect,
    initialViewport,
    dataViewport,
    layerExecutions,
    drillablePredicates,
    onCenterPositionChanged,
    onZoomChanged,
    onDrill,
    afterRender,
    config,
    backend,
}: MapControllerProps): ReactElement | null {
    const resolvedBackend = useBackend(backend);
    const { map, tooltip, isMapReady } = useMapInitialization(
        mapContainerRef,
        config,
        initialViewport,
        resolvedBackend,
    );
    const adapterContext = useGeoAdapterContext();

    const runtimeValue = useMemo(
        () => ({
            map,
            tooltip,
            isMapReady,
            adapterContext,
        }),
        [map, tooltip, isMapReady, adapterContext],
    );

    return (
        <MapRuntimeProvider value={runtimeValue}>
            <MapLifecycleEffects
                chartContainerRect={chartContainerRect}
                initialViewport={initialViewport}
                dataViewport={dataViewport}
                config={config}
                layerExecutions={layerExecutions}
                drillablePredicates={drillablePredicates}
                onCenterPositionChanged={onCenterPositionChanged}
                onZoomChanged={onZoomChanged}
                onDrill={onDrill}
                afterRender={afterRender}
            />
        </MapRuntimeProvider>
    );
}

function MapLifecycleEffects({
    chartContainerRect,
    initialViewport,
    dataViewport,
    config,
    layerExecutions,
    drillablePredicates,
    onCenterPositionChanged,
    onZoomChanged,
    onDrill,
    afterRender,
}: {
    chartContainerRect: ContentRect | null;
    initialViewport: Partial<IMapViewport> | null;
    dataViewport: Partial<IMapViewport> | null;
    config: IGeoChartConfig | undefined;
    layerExecutions: ILayerExecutionRecord[];
    drillablePredicates: IHeaderPredicate[];
    onCenterPositionChanged?: CenterPositionChangedCallback;
    onZoomChanged?: ZoomChangedCallback;
    onDrill?: OnFiredDrillEvent;
    afterRender?: () => void;
}): ReactElement | null {
    const { map, isMapReady } = useMapRuntime();

    useMapResize(map, isMapReady, chartContainerRect, initialViewport);
    useApplyViewportOnConfigChange(map, isMapReady, config, dataViewport);

    useMapCallbacks(map, {
        onCenterPositionChanged,
        onZoomChanged,
    });

    useSyncLayersToMap({
        drillablePredicates,
        onDrill,
        enableDrillMenuPositioningAtCursor: config?.enableDrillMenuPositioningAtCursor ?? false,
    });

    useAfterRender(map, afterRender, layerExecutions);

    return null;
}
