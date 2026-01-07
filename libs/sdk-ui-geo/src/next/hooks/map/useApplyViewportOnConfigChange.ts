// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo, useRef } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import { computeViewportFromConfig, getViewportConfigKey } from "../../map/viewport/viewportResolution.js";
import type { IGeoChartNextConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";

/**
 * Applies configured viewport whenever the viewport-related config changes.
 *
 * @remarks
 * `useMapInitialization` intentionally captures only the initial viewport and does not re-center the map on
 * prop changes. This hook provides the missing behavior for Analytical Designer: when the user changes
 * "Default viewport", we apply the new viewport to the already-initialized map.
 *
 * We only react to viewport-relevant config changes (`center`/`zoom` or `viewport.area`).
 * Data changes are intentionally ignored to avoid unexpected re-centering during interactions.
 *
 * The current `dataViewport` is still passed in so that switching to `"auto"` (or clearing the preset)
 * applies the latest data-derived bounds.
 *
 * @internal
 */
export function useApplyViewportOnConfigChange(
    map: IMapFacade | null,
    isMapReady: boolean,
    config: IGeoChartNextConfig | undefined,
    dataViewport: Partial<IMapViewport> | null,
): void {
    const configKey = useMemo(() => getViewportConfigKey(config), [config]);
    const previousConfigKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        const previousKey = previousConfigKeyRef.current;
        previousConfigKeyRef.current = configKey;

        // First run: map just initialized with the initial viewport already applied.
        if (previousKey === null) {
            return;
        }

        if (previousKey === configKey) {
            return;
        }

        const viewportToApply = computeViewportFromConfig(config, dataViewport);
        if (!viewportToApply) {
            return;
        }
        applyViewport(map, viewportToApply, true);
    }, [map, isMapReady, configKey, config, dataViewport]);
}
