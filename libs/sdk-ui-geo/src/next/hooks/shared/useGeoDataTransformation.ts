// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { DataViewFacade } from "@gooddata/sdk-ui";

import { getGeoData } from "../../features/data/transformation.js";
import { IGeoData } from "../../types/shared.js";

/**
 * Transforms DataView into IGeoData structure.
 *
 * @remarks
 * This hook transforms the execution result data view into the IGeoData format
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
export function useGeoDataTransformation(dataView: DataViewFacade | null): IGeoData | null {
    const intl = useIntl();

    return useMemo(() => {
        if (!dataView) {
            return null;
        }

        // Localized strings for empty and null values
        const emptyHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });
        const nullHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });

        // Transform data view to geo data structure
        return getGeoData(dataView, emptyHeaderString, nullHeaderString);
    }, [dataView, intl]);
}
