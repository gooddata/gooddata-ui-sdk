// (C) 2023-2024 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type IPredictionResult = {
    executionResultId: string;
    widgetRef: ObjRef;
    predictionData: object;
};

/**
 * @internal
 */
export interface IPredictionState {
    predictionResults: IPredictionResult[];
}

/**
 * @internal
 */
export const predictionInitialState: IPredictionState = { predictionResults: [] };
