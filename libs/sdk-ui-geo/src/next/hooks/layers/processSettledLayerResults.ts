// (C) 2025-2026 GoodData Corporation

import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

interface IRejectedLayerResult {
    layerId: string | undefined;
    error: GoodDataSdkError;
}

interface IProcessSettledLayerResultsParams<T> {
    settledResults: PromiseSettledResult<T>[];
    layerExecutions: ILayerExecutionRecord[];
    onRejected?: (result: IRejectedLayerResult) => void;
}

export interface IProcessedSettledLayerResults<T> {
    fulfilledValues: T[];
    firstError?: GoodDataSdkError;
}

/**
 * Collects fulfilled layer results and preserves the first converted error for partial-failure flows.
 *
 * @internal
 */
export function processSettledLayerResults<T>({
    settledResults,
    layerExecutions,
    onRejected,
}: IProcessSettledLayerResultsParams<T>): IProcessedSettledLayerResults<T> {
    const fulfilledValues: T[] = [];
    let firstError: GoodDataSdkError | undefined;

    settledResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
            fulfilledValues.push(result.value);
            return;
        }

        const error = convertError(result.reason);
        if (!firstError) {
            firstError = error;
        }

        onRejected?.({
            layerId: layerExecutions[index]?.layerId,
            error,
        });
    });

    return {
        fulfilledValues,
        firstError,
    };
}
