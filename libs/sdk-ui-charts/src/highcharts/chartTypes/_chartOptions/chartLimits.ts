// (C) 2007-2026 GoodData Corporation

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { unsupportedNegativeValuesTypes } from "./chartCapabilities.js";
import { type IChartLimits } from "../../../interfaces/chartConfig.js";
import {
    DEFAULT_CATEGORIES_LIMIT,
    DEFAULT_DATA_POINTS_LIMIT,
    DEFAULT_SERIES_LIMIT,
    HEATMAP_DATA_POINTS_LIMIT,
    PIE_CHART_LIMIT,
    SANKEY_CHART_DATA_POINT_LIMIT,
    SANKEY_CHART_NODE_LIMIT,
    SOFT_DEFAULT_CATEGORIES_LIMIT,
    SOFT_DEFAULT_DATA_POINTS_LIMIT,
    SOFT_DEFAULT_SERIES_LIMIT,
    SOFT_PIE_CHART_LIMIT,
    SOFT_SANKEY_CHART_DATA_POINT_LIMIT,
    SOFT_SANKEY_CHART_NODE_LIMIT,
    SOFT_WATERFALL_CHART_DATA_POINT_LIMIT,
    WATERFALL_CHART_DATA_POINT_LIMIT,
} from "../../constants/limits.js";
import { type ChartType } from "../../typings/chartType.js";
import { type IChartOptions, type ISeriesDataItem, type ISeriesItem } from "../../typings/unsafe.js";
import { isDataOfReasonableSize } from "../_chartCreators/highChartsCreators.js";
import { isOneOfTypes, isTreemap } from "../_util/common.js";

export interface IValidationResult {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

const isNegativeNumber = (n: number | null | undefined): boolean => typeof n === "number" && n < 0;

export function isNegativeValueIncluded(series: ISeriesItem[] | undefined): boolean {
    if (!series) {
        return false;
    }
    return series.some((seriesItem: ISeriesItem) =>
        (seriesItem.data || []).some(
            ({ y, value, weight }: ISeriesDataItem) =>
                isNegativeNumber(y) || isNegativeNumber(value) || isNegativeNumber(weight),
        ),
    );
}

function getChartLimits(type: string | undefined): IChartLimits {
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
        default:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
            };
    }
}

function getSoftChartLimits(type: ChartType): IChartLimits {
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

export function validateData(
    limits: IChartLimits | undefined,
    chartOptions: IChartOptions,
): IValidationResult {
    const type = chartOptions.type;
    const { isViewByTwoAttributes } = chartOptions;
    const finalLimits = limits || getChartLimits(type);
    let dataToValidate = chartOptions.data;
    if (isTreemap(type)) {
        dataToValidate = getTreemapDataForValidation(chartOptions.data);
    }

    return {
        dataTooLarge: !isDataOfReasonableSize(dataToValidate, finalLimits, isViewByTwoAttributes),
        hasNegativeValue:
            cannotShowNegativeValues(type) && isNegativeValueIncluded(chartOptions.data?.series),
    };
}

export function getIsFilteringRecommended(chartOptions: IChartOptions): boolean {
    const { type, isViewByTwoAttributes } = chartOptions;
    const limits = getSoftChartLimits(type as ChartType);
    const dataToValidate = isTreemap(type)
        ? getTreemapDataForValidation(chartOptions.data)
        : chartOptions.data;

    return !isDataOfReasonableSize(dataToValidate, limits, isViewByTwoAttributes);
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
    } = limits || getChartLimits(type);
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

    return result
        .filter((el) => el !== "")
        .join(" ")
        .trim();
}
