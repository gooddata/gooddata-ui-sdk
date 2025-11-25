// (C) 2025 GoodData Corporation

import { DataViewFacade } from "@gooddata/sdk-ui";

import { GeoDataTransformer, useGeoDataTransformation } from "./useGeoDataTransformation.js";
import { getAreaGeoData } from "../../features/data/areaTransformation.js";
import { IAreaGeoData } from "../../types/shared.js";

const transformAreaGeoData: GeoDataTransformer<IAreaGeoData> = (
    dataView,
    emptyHeaderString,
    nullHeaderString,
) => getAreaGeoData(dataView, emptyHeaderString, nullHeaderString);

/**
 * Transforms DataView into IAreaGeoData structure.
 *
 * @remarks
 * This hook transforms the execution result data view into the IAreaGeoData format
 * required for rendering geographic areas on the map. It handles:
 * - Extracting area identifiers (country codes, region IDs, etc.)
 * - Extracting color measure values for area fill
 * - Processing segment attribute values and URIs
 * - Handling tooltip text attribute values
 * - Managing empty and null values with localized strings
 *
 * @param dataView - Data view facade containing execution results
 * @returns Transformed area geographic data ready for map rendering, or null if no data view
 *
 * @alpha
 */
export function useAreaDataTransformation(dataView: DataViewFacade | null): IAreaGeoData | null {
    return useGeoDataTransformation(dataView, transformAreaGeoData);
}
