// (C) 2026 GoodData Corporation

import {
    type IMeasureDescriptor,
    type IMeasureGroupDescriptor,
    isMeasureGroupDescriptor,
    isMeasureLocator,
    isMeasureSort,
    sortDirection,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { type IAxisConfig, type IChartConfig } from "../../../interfaces/chartConfig.js";
import { VIEW_BY_DIMENSION_INDEX } from "../../constants/dimensions.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type ISeriesItem } from "../../typings/unsafe.js";
import { isMekko, isNegativeValueIncluded } from "../_util/common.js";

/** Width-only authoring state: Width (MEASURES) filled, Height (SECONDARY_MEASURES) empty. */
export function isMekkoWidthOnly(dv: DataViewFacade): boolean {
    return (
        !dv.def().isBucketEmpty(BucketNames.MEASURES) &&
        dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES)
    );
}

export interface IMekkoMeasures {
    width?: IMeasureDescriptor;
    height?: IMeasureDescriptor;
}

/** Width = first item (MEASURES), Height = last (SECONDARY_MEASURES); a lone measure goes by its bucket. */
export function getMekkoMeasures(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
): IMekkoMeasures {
    const { items } = measureGroup;
    if (items.length >= 2) {
        return { width: items[0], height: items[items.length - 1] };
    }
    return isMekkoWidthOnly(dv) ? { width: items[0] } : { height: items[0] };
}

/** Bucket-driven stacking sanitization, applied once at the ChartTransformation config boundary. */
export function getMekkoEffectiveConfig(config: IChartConfig, dv: DataViewFacade): IChartConfig {
    if (!isMekko(config.type)) {
        return config;
    }
    if (dv.def().isBucketEmpty(BucketNames.STACK)) {
        return { ...config, stackMeasures: false, stackMeasuresToPercent: false };
    }
    return isMekkoWidthOnly(dv) ? { ...config, stackMeasuresToPercent: true } : config;
}

/** Width-only without Stack By pins the flat zero axis to [0, 1] and hides it (min alone still gets padded). */
export function getMekkoWidthOnlyYAxisProps(
    mekkoWidthOnly: boolean,
    hasStackByAttribute: boolean,
    yAxisProps: IAxisConfig | undefined,
): IAxisConfig | undefined {
    return mekkoWidthOnly && !hasStackByAttribute
        ? { ...yAxisProps, min: "0", max: "1", visible: false }
        : yAxisProps;
}

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
 * Orders stacked Mekko columns by the config.sortBy measure sort — the stacked execution cannot
 * express it, so every series' data and the categories are permuted in lockstep on the client.
 * The column key is the Width total already reduced into point.z, or the Height total summed
 * across the stack; ties keep the backend order.
 */
export function sortMekkoColumnsByMeasure<TCategory>(
    series: ISeriesItem[],
    categories: TCategory[],
    config: IChartConfig,
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
): { series: ISeriesItem[]; categories: TCategory[] } {
    if (dv.def().isBucketEmpty(BucketNames.STACK) || !series[0]?.data?.length) {
        return { series, categories };
    }

    const measureSort = (config.sortBy ?? []).find(isMeasureSort);
    const measureLocator = measureSort?.measureSortItem.locators.find(isMeasureLocator);
    const measureId = measureLocator?.measureLocatorItem.measureIdentifier;
    if (!measureSort || !measureId) {
        return { series, categories };
    }

    const { width, height } = getMekkoMeasures(dv, measureGroup);
    const isWidthSort = width?.measureHeaderItem.localIdentifier === measureId;
    if (!isWidthSort && height?.measureHeaderItem.localIdentifier !== measureId) {
        return { series, categories };
    }

    const columnKeys = series[0].data.map((point, column) =>
        isWidthSort
            ? (point?.z ?? 0)
            : series.reduce((sum, seriesItem) => sum + (seriesItem.data?.[column]?.y ?? 0), 0),
    );
    const directionFactor = sortDirection(measureSort) === "desc" ? -1 : 1;
    const columnOrder = columnKeys
        .map((_, column) => column)
        .sort((a, b) => directionFactor * (columnKeys[a] - columnKeys[b]) || a - b);

    if (columnOrder.every((column, index) => column === index)) {
        return { series, categories };
    }

    return {
        series: series.map((seriesItem) => ({
            ...seriesItem,
            data: columnOrder.map((column) => (seriesItem.data ?? [])[column]),
        })),
        categories: columnOrder.map((column) => categories[column]),
    };
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
