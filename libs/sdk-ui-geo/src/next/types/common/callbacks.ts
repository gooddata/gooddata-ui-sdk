// (C) 2025-2026 GoodData Corporation

import { type IGeoLngLat } from "./coordinates.js";

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
