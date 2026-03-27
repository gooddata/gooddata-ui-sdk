// (C) 2025-2026 GoodData Corporation

import { type IGeoLngLat, type IGeoLngLatBounds } from "./coordinates.js";

/**
 * Called when the map center changes.
 *
 * @internal
 */
export type CenterPositionChangedCallback = (center: IGeoLngLat) => void;

/**
 * Called when the map zoom level changes.
 *
 * @internal
 */
export type ZoomChangedCallback = (zoom: number) => void;

/**
 * Called when the map visible bounds change.
 *
 * @internal
 */
export type BoundsChangedCallback = (bounds: IGeoLngLatBounds) => void;

/**
 * Called when a viewport change triggered by a real user interaction finishes.
 *
 * @internal
 */
export type ViewportInteractionEndCallback = () => void;
