// (C) 2022-2025 GoodData Corporation

import { type IForecastConfig } from "@gooddata/sdk-backend-spi";
import { type ForecastDataValue, type ISettings } from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";
import { getLighterColor } from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig, type IForecast } from "../../../interfaces/index.js";
import { type IPatternObject, type ISeriesDataItem, type ISeriesItem } from "../../typings/unsafe.js";

const FORECAST_COLOR_PERCENT = 0.8;
const FORECAST_LINE_COLOR_PERCENT = 0.5;

function getForecastColor(color: string | IPatternObject): string | IPatternObject {
    if (typeof color === "string") {
        return getLighterColor(color, FORECAST_COLOR_PERCENT);
    }
    return {
        pattern: {
            ...color.pattern,
            color: getLighterColor(color.pattern.color, FORECAST_COLOR_PERCENT),
        },
    };
}

function getForecastLineColor(color: string | IPatternObject): string {
    if (typeof color === "string") {
        return getLighterColor(color, FORECAST_LINE_COLOR_PERCENT);
    }
    return getLighterColor(color.pattern.color, FORECAST_LINE_COLOR_PERCENT);
}

export function assignForecastAxes(
    type: VisType,
    series: ISeriesItem[],
    forecastValues: ForecastDataValue[][],
): ISeriesItem[] {
    //in case of line chart, we need to add forecast axis
    if (type !== "line") {
        return series;
    }

    //if there is only one series, we need to add forecast axis
    if (series.length !== 1) {
        return series;
    }

    const [firstSeries] = series;
    const { data } = firstSeries;

    //if there is no data, we don't need to add forecast axis
    if (data.length === 0) {
        return series;
    }

    //if there is no forecast data, we don't need to add forecast axis
    const forecastData = forecastValues[0];
    if (!forecastData || forecastData.length === 0) {
        return series;
    }

    const last = data[data.length - 1];
    const seriesData = [...data, ...forecastData.map((): null => null)];

    const rangeData = [
        ...data.slice(0, -1).map((): null => null),
        {
            low: last.y,
            high: last.y,
            format: last.format,
            name: last.name,
        },
        ...forecastData.map((item) => {
            return {
                name: last.name,
                format: last.format,
                low: item.low,
                high: item.high,
                loading: item.loading,
            } as ISeriesDataItem;
        }),
    ];
    const predictedData = [
        ...data.slice(0, -1).map((): null => null),
        last,
        ...forecastData.map((item) => {
            return {
                name: last.name,
                format: last.format,
                y: item.prediction,
                loading: item.loading,
            } as ISeriesDataItem;
        }),
    ];

    return [
        { ...firstSeries, data: seriesData },
        {
            ...firstSeries,
            data: rangeData,
            type: "arearange",
            marker: {
                enabled: false,
            },
            color: getForecastColor(firstSeries.color),
            lineWidth: 2,
            lineColor: getForecastLineColor(firstSeries.color),
            showInLegend: false,
        },
        {
            ...firstSeries,
            data: predictedData,
            dashStyle: "dash",
            showInLegend: false,
        },
    ];
}

/**
 * @internal
 */
export function updateForecastWithSettings(
    config: IChartConfig,
    settings: ISettings,
    { enabled }: { enabled: boolean },
): IForecastConfig | undefined {
    //no forecast setting
    if (!config.forecast?.enabled || !enabled || !settings["enableSmartFunctions"]) {
        return undefined;
    }

    //check if confidence is set and is valid
    const confidenceLevel = normalizeConfidence(config.forecast.confidence ?? 0.95);
    const forecastPeriod = normalizePeriod(config.forecast.period ?? 3);
    if (isNaN(confidenceLevel) || isNaN(forecastPeriod)) {
        return undefined;
    }

    return {
        confidenceLevel,
        forecastPeriod,
        seasonal: config.forecast.seasonal ?? false,
    };
}

/**
 * Normalizes forecast confidence to be a number between 0 and 1
 */
function normalizeConfidence(confidence: IForecast["confidence"]): number {
    return confidence < 1 ? Math.max(confidence, 0) : Math.min(confidence, 100) / 100;
}

/**
 * Normalizes forecast period to be a number
 */
function normalizePeriod(period: IForecast["period"]): number {
    return parseInt(period.toString(), 10);
}
