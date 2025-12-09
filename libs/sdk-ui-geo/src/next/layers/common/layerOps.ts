// (C) 2025 GoodData Corporation

import type { IMapFacade } from "./mapFacade.js";

function hasValidStyle(map: IMapFacade): boolean {
    return Boolean(map?.getStyle?.());
}

export function removeLayerIfExists(map: IMapFacade, layerId: string): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
}

export function removeSourceIfExists(map: IMapFacade, sourceId: string): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
}
