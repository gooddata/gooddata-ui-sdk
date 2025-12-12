// (C) 2025 GoodData Corporation

import { type IGeoLngLat } from "./coordinates.js";

/**
 * Called when the map center changes.
 *
 * @alpha
 */
export type CenterPositionChangedCallback = (center: IGeoLngLat) => void;

/**
 * Called when the map zoom level changes.
 *
 * @alpha
 */
export type ZoomChangedCallback = (zoom: number) => void;
