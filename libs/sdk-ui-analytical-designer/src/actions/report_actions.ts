// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";
import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type ISortConfig,
} from "@gooddata/sdk-ui-ext/internal";

import { ActionTypeKeys } from "../constants/actions.js";

export const reportExecutionStarted = createAction(
    ActionTypeKeys.REPORT_EXECUTION_STARTED,
    (id: string, startTime: number) => ({
        payload: undefined,
        meta: { startTime, id },
    }),
);

/**
 * The finished payload is the render's own `IExecutionResult`, stored verbatim (and slated for
 * removal — see the dispatch site's TODO). Only `status` is CONSUMED anywhere: the embedded
 * render notification reads it off the finished/failed payload union, and a successful render
 * carries none — hence the narrow declared shape over an open record.
 */
export interface IReportExecutionFinishedPayload {
    status?: string;
    [key: string]: unknown;
}

export const reportExecutionFinished = createAction(
    ActionTypeKeys.REPORT_EXECUTION_FINISHED,
    (
        executedReport: IExecutionResult | IReportExecutionFinishedPayload,
        id: string,
        startTime: number,
        endTime: number,
    ) => ({
        payload: executedReport as IReportExecutionFinishedPayload,
        meta: { id, startTime, endTime },
    }),
);

export type IReportExecutionFinishedAction = ReturnType<typeof reportExecutionFinished>;

export interface IReportExecutionWarningPayload {
    limitBreaks: ReadonlyArray<IExecutionResultLimitBreak>;
}

export const reportExecutionWarning = createAction(
    ActionTypeKeys.REPORT_EXECUTION_WARNING,
    (payload: IReportExecutionWarningPayload, id: string, startTime: number, endTime: number) => ({
        payload,
        meta: { id, startTime, endTime },
    }),
);

export const reportExecutionFailed = createAction(
    ActionTypeKeys.REPORT_EXECUTION_ERROR,
    (error: unknown, id: string, startTime: number, endTime: number) => ({
        payload: error,
        error: true,
        meta: { id, startTime, endTime },
    }),
);

export type IReportExecutionFailedAction = ReturnType<typeof reportExecutionFailed>;

/**
 * REPORT_EXECUTION_ERROR's payload is a caught error, so it stays `unknown`; the string `status`
 * CODE riding on backend errors is the one field the sagas consume — the embedded render
 * notification forwards it as the error message, and the redirect saga compares it against
 * UNAUTHORIZED. The finished payload declares the same optional field, so the guard narrows the
 * whole finished/failed union.
 */
export function hasExecutionStatus(payload: unknown): payload is { status: string } {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "status" in payload &&
        typeof payload.status === "string"
    );
}

export const exportReport = createAction(ActionTypeKeys.REPORT_EXPORT_REQUESTED, (title: string) => ({
    payload: { title },
}));

export type IExportReportAction = ReturnType<typeof exportReport>;

export const exportReportStarted = createAction(
    ActionTypeKeys.REPORT_EXPORT_STARTED,
    (id: string, projectId: string, startTime: number) => ({
        payload: undefined,
        meta: { id, startTime, projectId },
    }),
);

export const exportReportFinished = createAction(
    ActionTypeKeys.REPORT_EXPORT_FINISHED,
    (id: string, projectId: string, startTime: number, duration: number, uri: string) => ({
        payload: undefined,
        meta: { id, projectId, startTime, duration, uri },
    }),
);

export const exportReportError = createAction(
    ActionTypeKeys.REPORT_EXPORT_ERROR,
    (id: string, projectId: string, startTime: number, duration: number, error: unknown) => {
        // the caught export error is probed for the two response fields the telemetry reports
        const response = (error as { response?: { status?: number; statusText?: string } } | undefined)
            ?.response;
        return {
            payload: error,
            error: true,
            meta: {
                id,
                projectId,
                startTime,
                duration,
                statusCode: response?.status,
                statusText: response?.statusText,
            },
        };
    },
);

export type IExportReportErrorAction = ReturnType<typeof exportReportError>;

export const reportTitleChange = createAction(ActionTypeKeys.REPORT_TITLE_CHANGE, (title: string) => ({
    payload: { title },
}));

export const reportDescriptionChange = createAction(
    ActionTypeKeys.REPORT_DESCRIPTION_CHANGE,
    (description: string) => ({ payload: { description } }),
);

export const newDerivedBucketItemsPlaced = createAction(
    ActionTypeKeys.NEW_DERIVED_BUCKET_ITEMS_PLACED,
    (referencePoint: IReferencePoint) => ({ payload: { referencePoint } }),
);

export type INewDerivedBucketItemsPlacedAction = ReturnType<typeof newDerivedBucketItemsPlaced>;

export const extendedReferencePointChanged = createAction(
    ActionTypeKeys.EXTENDED_REFERENCE_POINT_CHANGED,
    (extendedReferencePoint: IExtendedReferencePoint) => ({ payload: { extendedReferencePoint } }),
);

export type IExtendedReferencePointChangedAction = ReturnType<typeof extendedReferencePointChanged>;

export const uiExtendedReferencePointChanged = createAction(
    ActionTypeKeys.UI_EXTENDED_REFERENCE_POINT_CHANGED,
    (extendedReferencePoint: IExtendedReferencePoint, sortConfig?: ISortConfig) => ({
        payload: { extendedReferencePoint, sortConfig },
    }),
);

export type IUiExtendedReferencePointChangedAction = ReturnType<typeof uiExtendedReferencePointChanged>;
