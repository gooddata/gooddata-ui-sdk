// (C) 2021-2024 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface PredictionResultPayload {
    executionResultId: string;
    widgetRef: ObjRef;
    predictionData: object;
}

/**
 * @internal
 */
export interface PredictionResult extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.PREDICTION.RESULT";
    readonly payload: PredictionResultPayload;
}

/**
 * @internal
 */
export function setPredictionResult(
    executionResultId: string,
    widgetRef: ObjRef,
    predictionData: object,
    correlationId?: string,
): PredictionResult {
    return {
        type: "GDC.DASH/CMD.PREDICTION.RESULT",
        correlationId,
        payload: {
            executionResultId,
            widgetRef,
            predictionData,
        },
    };
}
