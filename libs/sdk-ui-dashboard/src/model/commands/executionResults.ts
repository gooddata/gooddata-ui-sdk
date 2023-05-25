// (C) 2021-2023 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IResultWarning, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import isString from "lodash/isString.js";
import { IExecutionResultEnvelope } from "../store/executionResults/types.js";
import { IDashboardCommand } from "./base.js";

/**
 * Triggers an event.
 *
 * @beta
 */
export interface UpsertExecutionResult extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT";
    readonly payload: IExecutionResultEnvelope;
}

function upsertExecutionResult(
    id: ObjRef | string,
    envelopeData: Omit<IExecutionResultEnvelope, "id">,
    correlationId?: string,
): UpsertExecutionResult {
    return {
        type: "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT",
        correlationId,
        payload: {
            ...envelopeData,
            id: isString(id) ? id : serializeObjRef(id),
        },
    };
}

/**
 * Creates an {@link UpsertExecutionResult} command that makes the relevant execution result indicate it is loading.
 *
 * @beta
 */
export function setExecutionResultLoading(
    id: ObjRef | string,
    correlationId?: string,
): UpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: true,
            executionResult: undefined,
            error: undefined,
            warnings: undefined,
        },
        correlationId,
    );
}

/**
 * Creates an {@link UpsertExecutionResult} command that makes the relevant execution result indicate an error and stop loading.
 *
 * @beta
 */
export function setExecutionResultError(
    id: ObjRef | string,
    error: GoodDataSdkError,
    correlationId?: string,
): UpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error,
            executionResult: undefined,
            warnings: undefined,
        },
        correlationId,
    );
}

/**
 * Creates an {@link UpsertExecutionResult} command that makes the relevant execution result set new result data and stop loading.
 *
 * @beta
 */
export function setExecutionResultData(
    id: ObjRef | string,
    executionResult: IExecutionResult,
    executionWarnings: IResultWarning[] | undefined,
    correlationId?: string,
): UpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error: undefined,
            executionResult,
            warnings: executionWarnings,
        },
        correlationId,
    );
}
