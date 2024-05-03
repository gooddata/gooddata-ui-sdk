// (C) 2019-2024 GoodData Corporation
import { DataValue, IResultHeader } from "@gooddata/sdk-model";
import { IForecastResult, IForecastConfig } from "@gooddata/sdk-backend-spi";
import { ExecutionResult, DimensionHeader } from "@gooddata/api-client-tiger";

export type Data = DataValue[][];

export type TransformedForecastResult = {
    readonly headerItems: IResultHeader[][][];
    readonly prediction: Data;
    readonly low: Data;
    readonly high: Data;
};

export function transformForecastResult(
    result: ExecutionResult,
    forecastResults: IForecastResult | undefined,
    forecastConfig: IForecastConfig | undefined,
    transformDimensionHeaders: (
        dimensionHeaders: DimensionHeader[],
        forecastResults: IForecastResult | undefined,
    ) => IResultHeader[][][],
): TransformedForecastResult {
    const period = forecastConfig?.forecastPeriod ?? 0;
    const prediction =
        forecastResults?.prediction.slice(
            forecastResults.prediction.length - period,
            forecastResults.prediction.length,
        ) ?? [];
    const low =
        forecastResults?.lowerBound.slice(
            forecastResults.prediction.length - period,
            forecastResults.prediction.length,
        ) ?? [];
    const high =
        forecastResults?.upperBound.slice(
            forecastResults.prediction.length - period,
            forecastResults.prediction.length,
        ) ?? [];

    return {
        // in API is data typed as Array<object>
        //data: result. as unknown as Data,
        low: [low],
        high: [high],
        prediction: [prediction],
        headerItems: transformDimensionHeaders(result.dimensionHeaders, forecastResults),
    };
}
