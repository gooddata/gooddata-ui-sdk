// (C) 2025 GoodData Corporation

import { ReactElement, RefObject, useMemo } from "react";

import { ContentRect } from "react-measure";

import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { MapRuntimeProvider, useMapRuntime } from "../context/MapRuntimeContext.js";
import { useGeoAdapterContext } from "../hooks/layers/useGeoAdapterContext.js";
import { useSyncLayersToMap } from "../hooks/layers/useSyncLayersToMap.js";
import { useAfterRender } from "../hooks/map/useAfterRender.js";
import { useMapCallbacks } from "../hooks/map/useMapCallbacks.js";
import { useMapInitialization } from "../hooks/map/useMapInitialization.js";
import { useMapResize } from "../hooks/map/useMapResize.js";
import { CenterPositionChangedCallback, ZoomChangedCallback } from "../types/common/callbacks.js";
import { IGeoChartNextConfig } from "../types/config/unified.js";
import { IMapViewport } from "../types/map/provider.js";
import { ILayerExecutionRecord } from "../types/props/geoChartNext/internal.js";

export type MapControllerProps = {
    mapContainerRef: RefObject<HTMLDivElement | null>;
    chartContainerRect: ContentRect | null;
    initialViewport: Partial<IMapViewport> | null;
    layerExecutions: ILayerExecutionRecord[];
    selectedSegmentItems: string[];
    drillablePredicates: IHeaderPredicate[];
    onCenterPositionChanged?: CenterPositionChangedCallback;
    onZoomChanged?: ZoomChangedCallback;
    afterRender?: () => void;
    config: IGeoChartNextConfig | undefined;
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
    selectedSegmentItems,
    drillablePredicates,
    onCenterPositionChanged,
    onZoomChanged,
    afterRender,
    config,
}: MapControllerProps): ReactElement | null {
    const { map, tooltip, isMapReady } = useMapInitialization(mapContainerRef, config, initialViewport);
    const adapterContext = useGeoAdapterContext({ selectedSegmentItems });

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
