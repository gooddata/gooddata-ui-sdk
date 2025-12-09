// (C) 2025 GoodData Corporation

import { DEFAULT_DATA_POINTS_LIMIT } from "../layers/pushpin/constants.js";
import { IGeoChartNextConfig } from "../types/config/unified.js";
import { IAreaGeoData } from "../types/geoData/area.js";
import { IPushpinGeoData } from "../types/geoData/pushpin.js";
import { isAreaGeoData, isPushpinGeoData } from "../types/geoData/typeGuards.js";

/**
 * Result of data size validation
 *
 * @internal
 */
export interface IDataSizeValidation {
    /**
     * Whether the data exceeds the configured limit
     */
    isDataTooLarge: boolean;
    /**
     * Actual number of data points
     */
    actualCount: number;
    /**
     * Configured limit
     */
    limit: number;
}

/**
 * Layer execution record for validation purposes
 *
 * @internal
 */
interface ILayerValidationRecord {
    layerId: string;
}

/**
 * Layer output for validation purposes
 *
 * @internal
 */
interface ILayerValidationOutput {
    output: { geoData: IPushpinGeoData | IAreaGeoData } | null;
}

/**
 * Gets the data points limit from config or falls back to default
 *
 * @param config - Chart configuration
 * @returns The configured limit or DEFAULT_DATA_POINTS_LIMIT
 *
 * @internal
 */
export function getDataPointsLimit(config: IGeoChartNextConfig | undefined): number {
    return config?.limit ?? DEFAULT_DATA_POINTS_LIMIT;
}

/**
 * Validates if pushpin data size is within the configured limit
 *
 * @param geoData - Pushpin geo data
 * @param limit - Maximum allowed data points
 * @returns Validation result with isDataTooLarge flag and counts
 *
 * @internal
 */
export function validatePushpinDataSize(geoData: IPushpinGeoData | null, limit: number): IDataSizeValidation {
    const actualCount = geoData?.location?.data?.length ?? 0;
    return {
        isDataTooLarge: actualCount > limit,
        actualCount,
        limit,
    };
}

/**
 * Validates if area data size is within the configured limit
 *
 * @param geoData - Area geo data
 * @param limit - Maximum allowed data points
 * @returns Validation result with isDataTooLarge flag and counts
 *
 * @internal
 */
export function validateAreaDataSize(geoData: IAreaGeoData | null, limit: number): IDataSizeValidation {
    const actualCount = geoData?.area?.data?.length ?? 0;
    return {
        isDataTooLarge: actualCount > limit,
        actualCount,
        limit,
    };
}

/**
 * Validates data size for all layers and returns validation result if any layer exceeds the limit.
 *
 * @param layerExecutions - Array of layer execution records
 * @param layerOutputs - Map of layer ID to prepared layer data
 * @param limit - Maximum allowed data points
 * @returns Validation info if data is too large, null otherwise
 *
 * @internal
 */
export function validateLayersDataSize(
    layerExecutions: ILayerValidationRecord[],
    layerOutputs: Map<string, ILayerValidationOutput>,
    limit: number,
): { actualCount: number; limit: number } | null {
    for (const { layerId } of layerExecutions) {
        const prepared = layerOutputs.get(layerId);
        const geoData = prepared?.output?.geoData;

        if (!geoData) {
            continue;
        }

        const validation = getGeoDataValidation(geoData, limit);
        if (validation?.isDataTooLarge) {
            return { actualCount: validation.actualCount, limit: validation.limit };
        }
    }

    return null;
}

function getGeoDataValidation(
    geoData: IPushpinGeoData | IAreaGeoData,
    limit: number,
): IDataSizeValidation | null {
    if (isPushpinGeoData(geoData)) {
        return validatePushpinDataSize(geoData, limit);
    }

    if (isAreaGeoData(geoData)) {
        return validateAreaDataSize(geoData, limit);
    }

    return null;
}
