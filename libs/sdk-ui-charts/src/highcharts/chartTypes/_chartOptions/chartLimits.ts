// (C) 2007-2026 GoodData Corporation

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { type IChartLimits } from "../../../interfaces/chartConfig.js";
import {
    COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT,
    DEFAULT_CATEGORIES_LIMIT,
    DEFAULT_DATA_POINTS_LIMIT,
    DEFAULT_SERIES_LIMIT,
    HEATMAP_DATA_POINTS_LIMIT,
    PIE_CHART_LIMIT,
    SANKEY_CHART_DATA_POINT_LIMIT,
    SANKEY_CHART_NODE_LIMIT,
    SOFT_COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT,
    SOFT_DEFAULT_CATEGORIES_LIMIT,
    SOFT_DEFAULT_DATA_POINTS_LIMIT,
    SOFT_DEFAULT_SERIES_LIMIT,
    SOFT_PIE_CHART_LIMIT,
    SOFT_SANKEY_CHART_DATA_POINT_LIMIT,
    SOFT_SANKEY_CHART_NODE_LIMIT,
    SOFT_STACKED_COLUMN_BAR_SERIES_LIMIT,
    SOFT_WATERFALL_CHART_DATA_POINT_LIMIT,
    STACKED_COLUMN_BAR_SERIES_LIMIT,
    WATERFALL_CHART_DATA_POINT_LIMIT,
} from "../../constants/limits.js";
import { type ChartType } from "../../typings/chartType.js";
import { type IChartOptions, type IChartOptionsData, type ISeriesItem } from "../../typings/unsafe.js";
import { isDataOfReasonableSize } from "../_chartCreators/highChartsCreators.js";
import {
    isMekko,
    isNegativeValueIncluded,
    isNegativeWidthIncluded,
    isOneOfTypes,
    isTreemap,
} from "../_util/common.js";

import { unsupportedNegativeValuesTypes } from "./chartCapabilities.js";

export interface IValidationResult {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

function getChartLimits(type: string | undefined, chartOptions?: IChartOptions): IChartLimits {
    const isStacked = !!chartOptions?.stacking;
    switch (type) {
        case VisualizationTypes.SCATTER:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_SERIES_LIMIT,
            };
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.PYRAMID:
            return {
                series: 1,
                categories: PIE_CHART_LIMIT,
            };
        case VisualizationTypes.TREEMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_DATA_POINTS_LIMIT,
                dataPoints: DEFAULT_DATA_POINTS_LIMIT,
            };
        case VisualizationTypes.HEATMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
                dataPoints: HEATMAP_DATA_POINTS_LIMIT,
            };

        case VisualizationTypes.SANKEY:
        case VisualizationTypes.DEPENDENCY_WHEEL:
            return {
                series: 1,
                nodes: SANKEY_CHART_NODE_LIMIT,
                dataPoints: SANKEY_CHART_DATA_POINT_LIMIT,
            };
        case VisualizationTypes.WATERFALL:
            return {
                series: 1,
                categories: WATERFALL_CHART_DATA_POINT_LIMIT,
                dataPoints: WATERFALL_CHART_DATA_POINT_LIMIT,
            };
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
            return {
                series: isStacked ? STACKED_COLUMN_BAR_SERIES_LIMIT : DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
            };
        default:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
            };
    }
}

function getSoftChartLimits(type: ChartType, chartOptions?: IChartOptions): IChartLimits {
    const isStacked = !!chartOptions?.stacking;
    switch (type) {
        case VisualizationTypes.SCATTER:
            return {
                series: SOFT_DEFAULT_SERIES_LIMIT,
                categories: SOFT_DEFAULT_SERIES_LIMIT,
            };
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.PYRAMID:
            return {
                series: 1,
                categories: SOFT_PIE_CHART_LIMIT,
            };
        case VisualizationTypes.TREEMAP:
            return {
                series: SOFT_DEFAULT_SERIES_LIMIT,
                categories: SOFT_DEFAULT_DATA_POINTS_LIMIT,
                dataPoints: SOFT_DEFAULT_DATA_POINTS_LIMIT,
            };
        case VisualizationTypes.HEATMAP:
            return {
                series: SOFT_DEFAULT_SERIES_LIMIT,
                categories: SOFT_DEFAULT_CATEGORIES_LIMIT,
                dataPoints: HEATMAP_DATA_POINTS_LIMIT,
            };

        case VisualizationTypes.SANKEY:
        case VisualizationTypes.DEPENDENCY_WHEEL:
            return {
                series: 1,
                nodes: SOFT_SANKEY_CHART_NODE_LIMIT,
                dataPoints: SOFT_SANKEY_CHART_DATA_POINT_LIMIT,
            };
        case VisualizationTypes.WATERFALL:
            return {
                series: 1,
                categories: SOFT_WATERFALL_CHART_DATA_POINT_LIMIT,
                dataPoints: SOFT_WATERFALL_CHART_DATA_POINT_LIMIT,
            };
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
            return {
                series: isStacked ? SOFT_STACKED_COLUMN_BAR_SERIES_LIMIT : SOFT_DEFAULT_SERIES_LIMIT,
                categories: SOFT_DEFAULT_CATEGORIES_LIMIT,
            };
        default:
            return {
                series: SOFT_DEFAULT_SERIES_LIMIT,
                categories: SOFT_DEFAULT_CATEGORIES_LIMIT,
            };
    }
}

export function cannotShowNegativeValues(type: string | undefined): boolean {
    return isOneOfTypes(type, unsupportedNegativeValuesTypes);
}

function getTreemapDataForValidation(data: any) {
    // filter out root nodes
    return {
        ...data,
        series: data.series.map((serie: any) => ({
            ...serie,
            data: serie.data.filter((dataItem: any) => dataItem.id === undefined),
        })),
    };
}

function isColumnOrBar(type: string | undefined): boolean {
    return type === VisualizationTypes.COLUMN || type === VisualizationTypes.BAR;
}

function getTotalDataPoints(data: IChartOptionsData | undefined): number {
    const series = data?.series;
    if (!Array.isArray(series)) {
        return 0;
    }
    return series.reduce((sum: number, serie: ISeriesItem) => sum + (serie.data?.length ?? 0), 0);
}

// Total rendered-points cap for column/bar, kept out of IChartLimits and checked alongside isDataOfReasonableSize.
function exceedsColumnBarTotalDataPoints(
    type: string | undefined,
    data: IChartOptionsData | undefined,
    limit: number,
): boolean {
    return isColumnOrBar(type) && getTotalDataPoints(data) > limit;
}

export function validateData(
    limits: IChartLimits | undefined,
    chartOptions: IChartOptions,
): IValidationResult {
    const type = chartOptions.type;
    const { isViewByTwoAttributes } = chartOptions;
    // Consumer-supplied limits intentionally replace per-type defaults.
    // The stacked column/bar series cap applies only when default limits are used.
    const finalLimits = limits || getChartLimits(type, chartOptions);
    let dataToValidate = chartOptions.data;
    if (isTreemap(type)) {
        dataToValidate = getTreemapDataForValidation(chartOptions.data);
    }

    const totalDataTooLarge =
        !limits && exceedsColumnBarTotalDataPoints(type, dataToValidate, COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT);

    return {
        dataTooLarge:
            totalDataTooLarge || !isDataOfReasonableSize(dataToValidate, finalLimits, isViewByTwoAttributes),
        hasNegativeValue:
            (cannotShowNegativeValues(type) && isNegativeValueIncluded(chartOptions.data?.series)) ||
            // Mekko: a negative Width (point `z`) yields a column with negative width — unrenderable.
            (isMekko(type) && isNegativeWidthIncluded(chartOptions.data?.series)),
    };
}

export function getIsFilteringRecommended(chartOptions: IChartOptions): boolean {
    const { type, isViewByTwoAttributes } = chartOptions;
    const limits = getSoftChartLimits(type as ChartType, chartOptions);
    const dataToValidate = isTreemap(type)
        ? getTreemapDataForValidation(chartOptions.data)
        : chartOptions.data;

    return (
        exceedsColumnBarTotalDataPoints(type, dataToValidate, SOFT_COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT) ||
        !isDataOfReasonableSize(dataToValidate, limits, isViewByTwoAttributes)
    );
}

/**
 * Creates a message for onDataTooLarge error, which contains the limits which were exceeded.
 */
export function getDataTooLargeErrorMessage(limits: IChartLimits, chartOptions: IChartOptions) {
    const { type, isViewByTwoAttributes } = chartOptions;
    const {
        series: seriesLimit,
        categories: categoriesLimit,
        nodes: nodesLimit,
        dataPoints: dataPointsLimit,
    } = limits || getChartLimits(type, chartOptions);
    const totalDataPointsLimit =
        !limits && isColumnOrBar(type) ? COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT : undefined;
    const dataToValidate = isTreemap(type)
        ? getTreemapDataForValidation(chartOptions.data)
        : chartOptions.data;

    const limitLog = (name: string, limit: number, actual: number) => {
        return actual > limit ? `${name} limit: ${limit} actual: ${actual}.` : "";
    };

    const result: string[] = [];

    if (seriesLimit !== undefined) {
        result.push(limitLog("Series", seriesLimit, dataToValidate.series.length));
    }

    if (categoriesLimit !== undefined) {
        if (isViewByTwoAttributes) {
            const categoriesLength = dataToValidate.categories.reduce((result: number, category: any) => {
                return result + category.categories.length;
            }, 0);
            result.push(limitLog("Categories", categoriesLimit, categoriesLength));
        } else {
            result.push(limitLog("Categories", categoriesLimit, dataToValidate.categories.length));
        }
    }

    if (nodesLimit !== undefined && Array.isArray(dataToValidate?.series)) {
        const nodesMax = Math.max(
            ...dataToValidate.series.map((serie: any) => {
                return Array.isArray(serie?.nodes) ? serie.nodes.length : 0;
            }),
        );
        result.push(limitLog("NodesMax", nodesLimit, nodesMax));
    }

    if (dataPointsLimit !== undefined && Array.isArray(dataToValidate?.series)) {
        const dataPointsMax = Math.max(
            ...dataToValidate.series.map((serie: any) => {
                return Array.isArray(serie?.data) ? serie.data.length : 0;
            }),
        );
        result.push(limitLog("DataPointsMax", dataPointsLimit, dataPointsMax));
    }

    if (totalDataPointsLimit !== undefined) {
        result.push(limitLog("TotalDataPoints", totalDataPointsLimit, getTotalDataPoints(dataToValidate)));
    }

    return result
        .filter((el) => el !== "")
        .join(" ")
        .trim();
}
