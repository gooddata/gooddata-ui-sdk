// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ObjRef } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";

export const hideSuccessMessage = createAction(ActionTypeKeys.DELETE_REPORT_SUCCESS_MESSAGE_HIDE);

export type IHideSuccessMessageAction = ReturnType<typeof hideSuccessMessage>;

export const deleteReportFinished = createAction(
    ActionTypeKeys.DELETE_REPORT_FINISHED,
    /**
     * `reset` is PRESENT exactly when the deleted report is the one currently open — the delete
     * saga decides that before it dispatches, and the presence is what
     * `isApplicationResetEvent` (store/app_context/application_reset_events.ts) matches, so the
     * conditional application reset lands in the SAME dispatch.
     */
    (time: number, deletingReportUri: string, reset?: IApplicationResetCarrier) => ({
        payload: {
            deletingReportUri,
            time,
            reset,
        },
    }),
);

export type IDeleteReportFinishedAction = ReturnType<typeof deleteReportFinished>;

export enum DeleteReportFailureReason {
    UNKNOWN = "UNKNOWN",
    FAILED_TO_DELETE_REFERENCED_REPORT = "FAILED_TO_DELETE_REFERENCED_REPORT",
}

export const deleteReportFailed = createAction(
    ActionTypeKeys.DELETE_REPORT_ERROR,
    (time: number, reason: DeleteReportFailureReason, error?: Error) => ({
        payload: {
            time,
            reason,
            error,
        },
    }),
);

export type IDeleteReportFailedAction = ReturnType<typeof deleteReportFailed>;

export interface IDeleteReportMeta {
    title: string;
}

export const deleteReportConfirmation = createAction(
    ActionTypeKeys.SHOW_DIALOG_DELETE_REPORT_CONFIRMATION,
    (insightRef: ObjRef, meta: IDeleteReportMeta) => ({
        payload: {
            insightRef,
            meta,
        },
    }),
);

export const deleteReport = createAction(
    ActionTypeKeys.DELETE_REPORT_REQUESTED,
    (insightRef: ObjRef, forceDelete: boolean, meta?: IDeleteReportMeta) => ({
        payload: {
            insightRef,
            forceDelete,
            meta,
        },
    }),
);

export type IDeleteReportAction = ReturnType<typeof deleteReport>;

export const deleteReportStarted = createAction(
    ActionTypeKeys.DELETE_REPORT_STARTED,
    (insightRef: ObjRef) => ({
        payload: {
            insightRef,
        },
    }),
);
