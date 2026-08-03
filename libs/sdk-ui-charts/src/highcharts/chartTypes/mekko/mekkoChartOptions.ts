// (C) 2026 GoodData Corporation

import { isMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import { VIEW_BY_DIMENSION_INDEX } from "../../constants/dimensions.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type ISeriesItem } from "../../typings/unsafe.js";
import { isMekko, isNegativeValueIncluded } from "../_util/common.js";

/**
 * Stacked Mekko executes with [[stackBy], [viewBy, MeasureGroup]], so the view-by header items
 * enumerate view × measure combinations. Downstream consumers (categories, point names, drills)
 * index them by column, so collapse to one item per view value. No-op without a measure group
 * in the view-by dimension or with fewer than two measures.
 *
 * The `index % measureCount` stride holds only because MeasureGroup is the last header in its
 * dimension (the invariant `findMeasureGroupInDimensions` enforces).
 */
export function collapseMekkoViewByItems(
    dv: DataViewFacade,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
): IUnwrappedAttributeHeadersWithItems | undefined | null {
    if (!viewByAttribute) {
        return viewByAttribute;
    }

    const viewByDimension = dv.meta().dimensions()[VIEW_BY_DIMENSION_INDEX];
    const measureGroup = viewByDimension?.headers?.find(isMeasureGroupDescriptor);
    const measureCount = measureGroup?.measureGroupHeader.items.length ?? 0;

    if (measureCount <= 1) {
        return viewByAttribute;
    }

    return {
        ...viewByAttribute,
        items: viewByAttribute.items.filter((_, index) => index % measureCount === 0),
    };
}

/**
 * Mekko can't stack to 100% with negative Height values (percent of mixed-sign segments is
 * undefined) — it falls back to absolute stacking. Evaluated once in getChartOptions and exposed
 * as chartOptions.stackToPercentBlockedByNegativeValues; downstream consumers (stacking config,
 * ChartTransformation) read that flag rather than re-deriving it.
 */
export function isMekkoPercentBlockedByNegatives(
    type: string | undefined,
    series: ISeriesItem[] | undefined,
): boolean {
    return isMekko(type) && isNegativeValueIncluded(series);
}

/**
 * Drops Mekko columns whose Width (point.z) is 0 — from every series' data and the categories in
 * lockstep. Negative z is kept so validateData can reject it. The first series drives the mask (all
 * series share the same z per column); inputs are returned unchanged when nothing is dropped.
 */
export function dropZeroWidthMekkoColumns<TCategory>(
    series: ISeriesItem[],
    categories: TCategory[],
): { series: ISeriesItem[]; categories: TCategory[] } {
    if (!series[0]?.data?.length) {
        return { series, categories };
    }

    const keepColumn = series[0].data.map((point) => typeof point?.z === "number" && point.z !== 0);

    if (keepColumn.every(Boolean)) {
        return { series, categories };
    }

    return {
        series: series.map((seriesItem) => ({
            ...seriesItem,
            data: (seriesItem.data ?? []).filter((_, index) => keepColumn[index]),
        })),
        categories: (categories ?? []).filter((_: TCategory, index: number) => keepColumn[index]),
    };
}
