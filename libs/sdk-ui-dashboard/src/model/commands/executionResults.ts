// (C) 2021-2026 GoodData Corporation

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionResultLimitBreak,
    type IResultWarning,
    type ObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type IExecutionResultEnvelope } from "../store/executionResults/types.js";

import { type IDashboardCommand } from "./base.js";

/**
 * Triggers an event.
 *
 * @beta
 */
export interface IUpsertExecutionResult extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT";
    readonly payload: IExecutionResultEnvelope;
}

function upsertExecutionResult(
    id: ObjRef | string,
    envelopeData: Omit<IExecutionResultEnvelope, "id">,
    correlationId?: string,
): IUpsertExecutionResult {
    return {
        type: "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT",
        correlationId,
        payload: {
            ...envelopeData,
            id: typeof id === "string" ? id : serializeObjRef(id),
        },
    };
}

/**
 * Creates an {@link IUpsertExecutionResult} command that makes the relevant execution result indicate it is loading.
 *
 * @beta
 */
export function setExecutionResultLoading(
    id: ObjRef | string,
    correlationId?: string,
): IUpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: true,
            executionResult: undefined,
            error: undefined,
            warnings: undefined,
            limitBreaks: undefined,
        },
        correlationId,
    );
}

/**
 * Creates an {@link IUpsertExecutionResult} command that makes the relevant execution result indicate an error and stop loading.
 *
 * @beta
 */
export function setExecutionResultError(
    id: ObjRef | string,
    error: GoodDataSdkError,
    correlationId?: string,
): IUpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error,
            warnings: undefined,
            limitBreaks: undefined,
        },
        correlationId,
    );
}

/**
 * Creates an {@link IUpsertExecutionResult} command for an execution that finished with an error
 * but still produced a result.
 *
 * @remarks
 * An empty-but-valid execution computes a result (with a resultId) yet surfaces as a no-data error.
 * Recording the result alongside the error lets consumers reference it (e.g. by resultId) while the
 * error keeps the widget in its terminal error state — including the non-exportable gating that the
 * presence of the result alone would otherwise lift.
 *
 * @beta
 */
export function setExecutionResultErrorWithResult(options: {
    id: ObjRef | string;
    error: GoodDataSdkError;
    executionResult: IExecutionResult;
    correlationId?: string;
}): IUpsertExecutionResult {
    const { id, error, executionResult, correlationId } = options;
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error,
            executionResult,
            warnings: undefined,
            limitBreaks: undefined,
        },
        correlationId,
    );
}

/**
 * Creates an {@link IUpsertExecutionResult} command that makes the relevant execution result set new result data and stop loading.
 *
 * @beta
 */
export function setExecutionResultData(
    id: ObjRef | string,
    executionResult: IExecutionResult,
    executionWarnings: IResultWarning[] | undefined,
    limitBreaks: IExecutionResultLimitBreak[] | undefined,
    correlationId?: string,
): IUpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error: undefined,
            executionResult,
            warnings: executionWarnings,
            limitBreaks,
        },
        correlationId,
    );
}
