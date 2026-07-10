// (C) 2026 GoodData Corporation

import { type ISeriesItem } from "../../typings/unsafe.js";
import { isMekko, isNegativeValueIncluded } from "../_util/common.js";

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
