// (C) 2025-2026 GoodData Corporation

import { isResultAttributeHeader } from "@gooddata/sdk-model";
import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IGeoCommonData } from "../../types/geoData/common.js";
import { compareAlphabetically, compareLexicographically } from "../../utils/alphabeticalSorting.js";
import type { IGeoLegendResult } from "../registry/adapterTypes.js";

/**
 * Sorts legend items by their raw element value: the displayed name can be number-formatted, and such
 * values do not sort as numbers ("1,000" would go before "200").
 */
function sortLegendItemsAlphabetically(
    items: IGeoLegendItem[],
    rawNameByUri: Map<string, string | null>,
): IGeoLegendItem[] {
    // empty and null elements have no raw value to sort by, they sort by their displayed placeholder
    const sortName = (item: IGeoLegendItem) => rawNameByUri.get(item.uri) || item.name;

    return [...items].sort((left, right) => {
        const nameComparison = compareAlphabetically(sortName(left), sortName(right));
        if (nameComparison !== 0) {
            return nameComparison;
        }

        const uriComparison = compareLexicographically(left.uri, right.uri);
        if (uriComparison !== 0) {
            return uriComparison;
        }

        return left.legendIndex - right.legendIndex;
    });
}

/**
 * Options for computing legend
 *
 * @internal
 */
export interface IComputeLegendOptions {
    /**
     * The layer type for legend item typing
     */
    layerType: "pushpin" | "area";

    /**
     * Whether the layer has size data (only pushpin supports this)
     */
    hasSizeData: boolean;
}

/**
 * Computes legend data from geo data and color strategy.
 *
 * @remarks
 * This utility is shared by both pushpin and area adapters to avoid code duplication.
 * It extracts unique segments and creates legend items with colors from the color strategy.
 *
 * @param geoData - The geo data containing segment information
 * @param colorStrategy - Color strategy for getting colors by index
 * @param options - Options specifying layer type and size availability
 * @returns Legend result with items and availability flags
 *
 * @internal
 */
export function computeLegend(
    geoData: IGeoCommonData,
    colorStrategy: IColorStrategy,
    options: IComputeLegendOptions,
): IGeoLegendResult {
    const { layerType, hasSizeData } = options;
    let items: IGeoLegendItem[] = [];

    if (geoData.segment) {
        const assignmentIndexByUri = new Map<string, number>();
        const rawNameByUri = new Map<string, string | null>();
        colorStrategy.getColorAssignment().forEach((assignment, assignmentIndex) => {
            if (isResultAttributeHeader(assignment.headerItem)) {
                const { uri, name } = assignment.headerItem.attributeHeaderItem;
                if (uri && !assignmentIndexByUri.has(uri)) {
                    assignmentIndexByUri.set(uri, assignmentIndex);
                    rawNameByUri.set(uri, name);
                }
            }
        });

        const uniqueSegments = new Map<string, { name: string; uri: string }>();
        geoData.segment.data.forEach((segmentValue: string, index: number) => {
            const uri = geoData.segment?.uris?.[index];
            if (uri && !uniqueSegments.has(uri)) {
                uniqueSegments.set(uri, { name: segmentValue, uri });
            }
        });
        items = Array.from(uniqueSegments.values()).map(({ name, uri }, index) => {
            const assignmentIndex = assignmentIndexByUri.get(uri) ?? index;
            return {
                type: layerType,
                name,
                uri,
                color: colorStrategy.getColorByIndex(assignmentIndex),
                legendIndex: assignmentIndex,
                isVisible: true,
            };
        });
        items = sortLegendItemsAlphabetically(items, rawNameByUri);
    }

    const available: IAvailableLegends = {
        hasCategoryLegend: items.length > 0,
        hasColorLegend: Boolean(geoData.color),
        hasSizeLegend: hasSizeData,
    };

    return { items, available };
}
