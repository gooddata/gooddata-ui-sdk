// (C) 2019-2025 GoodData Corporation
import { DimensionHeader, ExecutionResult } from "@gooddata/api-client-tiger";
import { IForecastConfig, IForecastResult } from "@gooddata/sdk-backend-spi";
import { DataValue, IResultHeader } from "@gooddata/sdk-model";

export type Data = DataValue[][];

export type TransformedForecastResult = {
    readonly headerItems: IResultHeader[][][];
    readonly prediction: Data;
    readonly low: Data;
    readonly high: Data;
    readonly loading: boolean;
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

    const prediction = fillData(forecastResults?.prediction, period);
    const low = fillData(forecastResults?.lowerBound, period);
    const high = fillData(forecastResults?.upperBound, period);

    return {
        // in API is data typed as Array<object>
        //data: result. as unknown as Data,
        low: [low],
        high: [high],
        prediction: [prediction],
        headerItems: transformDimensionHeaders(result.dimensionHeaders, forecastResults),
        loading: !forecastResults,
    };
}

function fillData(items: number[] | undefined, period: number): DataValue[] {
    if (!items) {
        const emptyData: (number | null)[] = [];
        for (let i = 0; i < period; i++) {
            emptyData.push(null);
        }
        return emptyData;
    }
    return items.slice(items.length - period, items.length);
}
