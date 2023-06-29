// (C) 2007-2020 GoodData Corporation
import { IChartLimits } from "../../../interfaces/index.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import {
    DEFAULT_CATEGORIES_LIMIT,
    DEFAULT_DATA_POINTS_LIMIT,
    DEFAULT_SERIES_LIMIT,
} from "../_chartCreators/commonConfiguration.js";
import {
    HEATMAP_DATA_POINTS_LIMIT,
    PIE_CHART_LIMIT,
    SANKEY_CHART_DATA_POINT_LIMIT,
    SANKEY_CHART_NODE_LIMIT,
    WATERFALL_CHART_DATA_POINT_LIMIT,
} from "../../constants/limits.js";
import { IChartOptions, ISeriesDataItem, ISeriesItem } from "../../typings/unsafe.js";
import { isOneOfTypes, isTreemap } from "../_util/common.js";
import { unsupportedNegativeValuesTypes } from "./chartCapabilities.js";
import { isDataOfReasonableSize } from "../_chartCreators/highChartsCreators.js";

export interface IValidationResult {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

export function isNegativeValueIncluded(series: ISeriesItem[]): boolean {
    return series.some((seriesItem: ISeriesItem) =>
        (seriesItem.data || []).some(
            ({ y, value, weight }: ISeriesDataItem) => y < 0 || value < 0 || weight < 0,
        ),
    );
}

function getChartLimits(type: string): IChartLimits {
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

export function cannotShowNegativeValues(type: string): boolean {
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

export function validateData(limits: IChartLimits, chartOptions: IChartOptions): IValidationResult {
    const { type, isViewByTwoAttributes } = chartOptions;
    const finalLimits = limits || getChartLimits(type);
    let dataToValidate = chartOptions.data;
    if (isTreemap(type)) {
        dataToValidate = getTreemapDataForValidation(chartOptions.data);
    }

    return {
        dataTooLarge: !isDataOfReasonableSize(dataToValidate, finalLimits, isViewByTwoAttributes),
        hasNegativeValue: cannotShowNegativeValues(type) && isNegativeValueIncluded(chartOptions.data.series),
    };
}
