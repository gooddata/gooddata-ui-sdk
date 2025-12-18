// (C) 2025 GoodData Corporation

import { type ReactElement, type RefObject, useMemo } from "react";

import { type ContentRect } from "react-measure";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { MapRuntimeProvider, useMapRuntime } from "../context/MapRuntimeContext.js";
import { useGeoAdapterContext } from "../hooks/layers/useGeoAdapterContext.js";
import { useSyncLayersToMap } from "../hooks/layers/useSyncLayersToMap.js";
import { useAfterRender } from "../hooks/map/useAfterRender.js";
import { useMapCallbacks } from "../hooks/map/useMapCallbacks.js";
import { useMapInitialization } from "../hooks/map/useMapInitialization.js";
import { useMapResize } from "../hooks/map/useMapResize.js";
import { type CenterPositionChangedCallback, type ZoomChangedCallback } from "../types/common/callbacks.js";
import { type IGeoChartNextConfig } from "../types/config/unified.js";
import { type IMapViewport } from "../types/map/provider.js";
import { type ILayerExecutionRecord } from "../types/props/geoChartNext/internal.js";

export type MapControllerProps = {
    mapContainerRef: RefObject<HTMLDivElement | null>;
    chartContainerRect: ContentRect | null;
    initialViewport: Partial<IMapViewport> | null;
    layerExecutions: ILayerExecutionRecord[];
    drillablePredicates: IHeaderPredicate[];
    onCenterPositionChanged?: CenterPositionChangedCallback;
    onZoomChanged?: ZoomChangedCallback;
    afterRender?: () => void;
    config: IGeoChartNextConfig | undefined;
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
    layerExecutions,
    drillablePredicates,
    onCenterPositionChanged,
    onZoomChanged,
    afterRender,
    config,
    backend,
}: MapControllerProps): ReactElement | null {
    const { map, tooltip, isMapReady } = useMapInitialization(
        mapContainerRef,
        config,
        initialViewport,
        backend,
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
                layerExecutions={layerExecutions}
                drillablePredicates={drillablePredicates}
                onCenterPositionChanged={onCenterPositionChanged}
                onZoomChanged={onZoomChanged}
                afterRender={afterRender}
            />
        </MapRuntimeProvider>
    );
}

function MapLifecycleEffects({
    chartContainerRect,
    initialViewport,
    layerExecutions,
    drillablePredicates,
    onCenterPositionChanged,
    onZoomChanged,
    afterRender,
}: {
    chartContainerRect: ContentRect | null;
    initialViewport: Partial<IMapViewport> | null;
    layerExecutions: ILayerExecutionRecord[];
    drillablePredicates: IHeaderPredicate[];
    onCenterPositionChanged?: CenterPositionChangedCallback;
    onZoomChanged?: ZoomChangedCallback;
    afterRender?: () => void;
}): ReactElement | null {
    const { map, isMapReady } = useMapRuntime();

    useMapResize(map, isMapReady, chartContainerRect, initialViewport);

    useMapCallbacks(map, {
        onCenterPositionChanged,
        onZoomChanged,
    });

    useSyncLayersToMap({
        drillablePredicates,
    });

    useAfterRender(map, afterRender, layerExecutions);

    return null;
}
