// (C) 2026 GoodData Corporation

import type { ReactElement } from "react";

import { type Mock, expect } from "vitest";

import { GeoChartInternal } from "@gooddata/sdk-ui-geo/internal";

import { type IVisConstruct } from "../../../../interfaces/Visualization.js";

/**
 * Common overrides accepted by `createComponent` in geo chart tests.
 */
export interface ICreateComponentOverrides {
    environment?: IVisConstruct["environment"];
    visualizationProperties?: IVisConstruct["visualizationProperties"];
}

interface IGeoChartCallbackProps {
    onCenterPositionChanged?: (center: { lat: number; lng: number }) => void;
    onZoomChanged?: (zoom: number) => void;
}

/**
 * Extracts the last `GeoChartInternal` render call from a mock render function
 * and returns its center/zoom callback props.
 */
export function extractGeoChartCallbacks(mockRenderFun: Mock): IGeoChartCallbackProps {
    const chartCall = [...mockRenderFun.mock.calls]
        .reverse()
        .find(([node]) => (node as ReactElement)?.type === GeoChartInternal);

    if (!chartCall) {
        throw new Error("Missing GeoChartInternal render call.");
    }

    return (chartCall[0] as ReactElement).props as IGeoChartCallbackProps;
}

/**
 * Fires center and zoom callbacks on the chart and asserts that pushData
 * was called with the expected viewport values and `ignoreUndoRedo: true`.
 *
 * The sync is coalesced via a microtask, so we await before asserting.
 */
export async function fireAndExpectViewportSync(
    mockRenderFun: Mock,
    pushData: Mock,
    newCenter: { lat: number; lng: number },
    newZoom: number,
): Promise<void> {
    const chartProps = extractGeoChartCallbacks(mockRenderFun);

    chartProps.onCenterPositionChanged?.(newCenter);
    chartProps.onZoomChanged?.(newZoom);

    // Flush the coalesced microtask sync
    await Promise.resolve();

    const viewportCalls = pushData.mock.calls.filter((call) => call[0]?.ignoreUndoRedo === true);
    expect(viewportCalls.length).toBeGreaterThanOrEqual(1);

    const lastViewportCall = viewportCalls.at(-1)?.[0];
    expect(lastViewportCall?.properties?.controls?.center).toEqual(newCenter);
    expect(lastViewportCall?.properties?.controls?.zoom).toBe(newZoom);
}

/**
 * Fires center and zoom callbacks on the chart and asserts that no
 * viewport sync (`ignoreUndoRedo: true`) pushData calls were made.
 *
 * Filters by `ignoreUndoRedo` so the assertion is robust even if
 * `visualization.update()` triggers other pushData calls.
 */
export async function fireAndExpectNoViewportSync(
    mockRenderFun: Mock,
    pushData: Mock,
    newCenter: { lat: number; lng: number },
    newZoom: number,
): Promise<void> {
    const chartProps = extractGeoChartCallbacks(mockRenderFun);
    const viewportCallsBefore = pushData.mock.calls.filter((call) => call[0]?.ignoreUndoRedo === true).length;

    chartProps.onCenterPositionChanged?.(newCenter);
    chartProps.onZoomChanged?.(newZoom);

    // Flush the coalesced microtask sync
    await Promise.resolve();

    const viewportCallsAfter = pushData.mock.calls.filter((call) => call[0]?.ignoreUndoRedo === true).length;
    expect(viewportCallsAfter).toBe(viewportCallsBefore);
}
