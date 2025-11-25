// (C) 2025 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";

import { GeoDataTransformer, useGeoDataTransformation } from "./useGeoDataTransformation.js";
import { getPushpinGeoData } from "../../features/data/pushpinTransformation.js";
import { IPushpinGeoData } from "../../types/shared.js";

const transformPushpinGeoData: GeoDataTransformer<IPushpinGeoData> = (
    dataView,
    emptyHeaderString,
    nullHeaderString,
) => getPushpinGeoData(dataView, emptyHeaderString, nullHeaderString);

/**
 * Transforms DataView into IPushpinGeoData structure.
 *
 * @remarks
 * This hook transforms the execution result data view into the IPushpinGeoData format
 * required for rendering pushpins on the map. It handles:
 * - Parsing location coordinates (single location or lat/lng pair)
 * - Extracting size and color measure values
 * - Processing segment attribute values and URIs
 * - Handling tooltip text attribute values
 * - Managing empty and null values with localized strings
 *
 * The transformation logic is based on the existing getGeoData helper from the core implementation.
 *
 * @param dataView - Data view facade containing execution results
 * @returns Transformed geographic data ready for map rendering, or null if no data view
 *
 * @alpha
 */
export function usePushpinDataTransformation(dataView: DataViewFacade | null): IPushpinGeoData | null {
    return useGeoDataTransformation(dataView, transformPushpinGeoData);
}
