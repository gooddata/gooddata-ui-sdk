// (C) 2021 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import isString from "lodash/isString";
import { IExecutionResultEnvelope } from "../store/executionResults/types";
import { IDashboardCommand } from "./base";

/**
 * Triggers an event.
 *
 * @alpha
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
 * @alpha
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
        },
        correlationId,
    );
}

/**
 * Creates an {@link UpsertExecutionResult} command that makes the relevant execution result indicate an error and stop loading.
 *
 * @alpha
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
        },
        correlationId,
    );
}

/**
 * Creates an {@link UpsertExecutionResult} command that makes the relevant execution result set new result data and stop loading.
 *
 * @alpha
 */
export function setExecutionResultData(
    id: ObjRef | string,
    executionResult: IExecutionResult,
    correlationId?: string,
): UpsertExecutionResult {
    return upsertExecutionResult(
        id,
        {
            isLoading: false,
            error: undefined,
            executionResult,
        },
        correlationId,
    );
}
