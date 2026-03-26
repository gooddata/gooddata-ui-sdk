// (C) 2026 GoodData Corporation

import type { IChatVisualisationDefinition, IForecastConfig } from "@gooddata/sdk-backend-spi";
import type { IGenAIVisualization } from "@gooddata/sdk-model";
import type { IForecast } from "@gooddata/sdk-ui-charts";

export interface INormalizedForecastValues {
    period: number;
    confidence: number;
    seasonal: boolean;
}

export function mapVisualizationForecastToChartConfig(
    visualization?: IGenAIVisualization | IChatVisualisationDefinition,
): IForecast | undefined {
    const forecastValues = getNormalizedForecastValues(visualization);

    if (!forecastValues) {
        return undefined;
    }

    return {
        enabled: true,
        period: forecastValues.period,
        confidence: forecastValues.confidence,
        seasonal: forecastValues.seasonal,
    };
}

export function mapVisualizationForecastToBackendConfig(
    visualization?: IGenAIVisualization | IChatVisualisationDefinition,
): IForecastConfig | undefined {
    const forecastValues = getNormalizedForecastValues(visualization);

    if (!forecastValues) {
        return undefined;
    }

    return {
        forecastPeriod: forecastValues.period,
        confidenceLevel: forecastValues.confidence,
        seasonal: forecastValues.seasonal,
    };
}

export function getNormalizedForecastValues(
    visualization?: IGenAIVisualization | IChatVisualisationDefinition,
): INormalizedForecastValues | undefined {
    const forecast = visualization?.config?.forecast;

    if (!forecast) {
        return undefined;
    }

    const period = Number.parseInt(forecast.forecastPeriod.toString(), 10);
    const confidence = Number(forecast.confidenceLevel);

    if (!Number.isFinite(period) || period <= 0 || !Number.isFinite(confidence)) {
        return undefined;
    }

    const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
    if (normalizedConfidence <= 0 || normalizedConfidence > 1) {
        return undefined;
    }

    return {
        period,
        confidence: normalizedConfidence,
        seasonal: forecast.seasonal,
    };
}
