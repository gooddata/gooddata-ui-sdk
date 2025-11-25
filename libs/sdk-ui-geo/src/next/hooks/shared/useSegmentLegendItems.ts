// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { IGeoCommonData } from "../../types/shared.js";

interface IUseSegmentLegendItemsConfig<TGeoData extends IGeoCommonData> {
    type: IPushpinCategoryLegendItem["type"];
    dataView: DataViewFacade | null;
    geoData: TGeoData | null;
    colorStrategy: IColorStrategy | null;
}

/**
 * Generic hook for building legend items from segment data.
 *
 * @internal
 */
export function useSegmentLegendItems<TGeoData extends IGeoCommonData>({
    type,
    dataView,
    geoData,
    colorStrategy,
}: IUseSegmentLegendItemsConfig<TGeoData>): IPushpinCategoryLegendItem[] {
    return useMemo(() => {
        if (!dataView || !geoData?.segment || !colorStrategy) {
            return [];
        }

        const uniqueSegments = new Map<string, { name: string; uri: string }>();

        geoData.segment.data.forEach((segmentValue: string, index: number) => {
            const uri = geoData.segment?.uris?.[index];
            if (uri && !uniqueSegments.has(uri)) {
                uniqueSegments.set(uri, {
                    name: segmentValue,
                    uri,
                });
            }
        });

        return Array.from(uniqueSegments.values()).map(({ name, uri }, index) => ({
            type,
            name,
            uri,
            color: colorStrategy.getColorByIndex(index),
            legendIndex: index,
            isVisible: true,
        }));
    }, [type, dataView, geoData, colorStrategy]);
}
