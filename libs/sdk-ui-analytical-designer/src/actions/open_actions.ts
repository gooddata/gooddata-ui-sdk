// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IInsight, type ObjRef } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IOpenReportResult } from "../store/report/open_report_operation.js";
import { type OpenReportError } from "../store/report/report_state.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";
import { type ILoadedReportItems, type IMissingDateFilterItem } from "../typings/report.js";

export const openReport = createAction(
    ActionTypeKeys.OPEN_REPORT_REQUESTED,
    (insightRef: ObjRef, forceOpen: boolean) => ({
        payload: {
            insightRef,
            forceOpen,
        },
    }),
);

export type IOpenReportRequestedAction = ReturnType<typeof openReport>;

export const openReportStarted = createAction(
    ActionTypeKeys.OPEN_REPORT_STARTED,
    (projectId: string, reportId: string) => ({
        payload: { projectId, reportId },
    }),
);

export interface IOpenReportFailedActionPayload {
    isDraft?: boolean;
    reason?: OpenReportError;
    /**
     * The items the insight references but the workspace no longer has. Present only on a
     * not-found failure (no `reason`) caused by them; the not-found page lists them.
     */
    missingItems?: ReadonlyArray<IMissingDateFilterItem>;
    /**
     * An open failure resets the application: the affected slices honor this action via
     * `isApplicationResetEvent` (store/app_context/application_reset_events.ts), and the carrier
     * holds the two recomputed values the reset needs.
     */
    reset: IApplicationResetCarrier;
}

export const openReportFailed = createAction(
    ActionTypeKeys.OPEN_REPORT_FAILED,
    (
        reset: IApplicationResetCarrier,
        isDraft = false,
        reason?: OpenReportError,
        missingItems?: ReadonlyArray<IMissingDateFilterItem>,
    ) => ({
        payload: {
            isDraft,
            reason,
            reset,
            ...(missingItems?.length ? { missingItems } : {}),
        } as IOpenReportFailedActionPayload,
    }),
);

export type IOpenReportFailedAction = ReturnType<typeof openReportFailed>;

export const openReportFinished = createAction(
    ActionTypeKeys.OPEN_REPORT_FINISHED,
    /**
     * `result`: the open-report saga computes the whole cross-domain application of the loaded
     * insight (store/report/open_report_operation.ts) and THIS event carries it — each owning slice
     * consumes its own value, in ONE dispatch.
     */
    (
        insight: IInsight,
        loadedItems: ILoadedReportItems,
        time: number,
        useDefaultClass: boolean,
        result: IOpenReportResult,
        isDraft = false,
    ) => ({
        payload: {
            insight,
            loadedItems,
            time,
            useDefaultClass,
            result,
            isDraft,
        },
    }),
);

export type IOpenReportFinishedAction = ReturnType<typeof openReportFinished>;

export const openReportConfirmation = createAction(
    ActionTypeKeys.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION,
    (insightRef: ObjRef) => ({
        payload: {
            insightRef,
        },
    }),
);
