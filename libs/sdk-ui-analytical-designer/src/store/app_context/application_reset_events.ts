// (C) 2026 GoodData Corporation

import { type Action, createAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { type IDeleteReportFinishedAction, deleteReportFinished } from "../../actions/delete_actions.js";
import { type IOpenReportFailedAction, openReportFailed } from "../../actions/open_actions.js";
import {
    type IApplicationResetCarrier,
    type IInsightContentResetCarrier,
} from "../../typings/application_reset.js";
import { getDefaultVisualizationClass } from "../visualization_classes/visualization_classes_helpers.js";
import { type IVisualizationClassesState } from "../visualization_classes/visualization_classes_state.js";

/**
 * THE APPLICATION RESETS AS SEMANTIC EVENTS.
 *
 * The affected slices honor these events in their own `extraReducers` — each slice resets what it
 * owns, and THIS module is the single place that says which actions reset what scope:
 *
 * - **insight-content clear** ({@link isInsightContentResetEvent}): the open insight's content
 *   leaves — buckets, both reference points, filter bar, chart sort, properties (+meta),
 *   attribute elements, execution, bucket notifications, configuration panel — plus a fresh
 *   `sessionId`. Every application reset implies it.
 * - **application reset** ({@link isApplicationResetEvent}): the above plus the report leaves
 *   (nowOpen/opening/lastSavedObject), the insight meta leaves (title/tags/summary/layers), the
 *   dashboards usage and the re-defaulted visualization class.
 *
 * `RESET_APPLICATION` and `CLEAR_INSIGHT_CONTENT` are user/embedding INTENT and write nothing
 * themselves; `sagas/reset_sagas.ts` translates each into its event here. The other three reset paths
 * have no trigger of their own and carry the reset ON the action that decides it, so the reset stays
 * in the SAME dispatch as the writes it must land under:
 *
 * - `OPEN_REPORT_FAILED` resets unconditionally — its creator carries the payload below, and the
 *   failure writes (`report.loadingError`, the NOT_FOUND execution status, the reference point's
 *   `reportNotFound` flag) COMPOSE with the reset inside their own slices' cases, so "reset first,
 *   flags on top" needs no reducer ordering.
 * - `DELETE_REPORT_FINISHED` resets exactly when the deleted report is the one open — the delete
 *   saga knows that before it dispatches, so the payload's `reset` PRESENCE is the condition.
 * - a navigation that leaves the workspace or clears the open report resets the WHOLE application
 *   ({@link wholeApplicationReset}) — the router saga decides and dispatches it (router_sagas.ts).
 *
 * WHAT THE CARRIERS ARE FOR. Two reset targets are RECOMPUTED rather than reset to a constant, and
 * neither recomputation belongs in a reducer: a fresh `sessionId` is impure (uuid), and the default
 * visualization class is derived from a FOREIGN domain value (`data.visualizationClasses` — the
 * class slice must not cross-read it). Both ride on the event, built at the dispatch boundary by
 * {@link buildApplicationResetCarrier}. Everything else resets to the owning domain's own initial
 * state and needs nothing carried.
 */

/** Boundary builder — impure (fresh uuid), for sagas only, never for reducers. */
export function buildInsightContentResetCarrier(): IInsightContentResetCarrier {
    return { sessionId: uuid() };
}

/** Boundary builder — impure (fresh uuid), for sagas only, never for reducers. */
export function buildApplicationResetCarrier(
    visualizationClasses: IVisualizationClassesState,
): IApplicationResetCarrier {
    return {
        sessionId: uuid(),
        defaultVisualizationClass: getDefaultVisualizationClass(visualizationClasses) ?? null,
    };
}

export enum ApplicationResetActionTypeKeys {
    STORE_INSIGHT_CONTENT_CLEARED = "STORE_INSIGHT_CONTENT_CLEARED",
    STORE_APPLICATION_CLEARED = "STORE_APPLICATION_CLEARED",
    STORE_WHOLE_APPLICATION_RESET = "STORE_WHOLE_APPLICATION_RESET",
}

/**
 * The embedding host asked for the insight content to be cleared (`CLEAR_INSIGHT_CONTENT`,
 * translated by reset_sagas) — the report/insight-meta leaves stay.
 */
export const insightContentCleared = createAction(
    ApplicationResetActionTypeKeys.STORE_INSIGHT_CONTENT_CLEARED,
    (payload: { reset: IInsightContentResetCarrier }) => ({ payload }),
);

/**
 * The user (or the embedding host) cleared the application back to the empty editor
 * (`RESET_APPLICATION`, translated by reset_sagas).
 */
export const applicationCleared = createAction(
    ApplicationResetActionTypeKeys.STORE_APPLICATION_CLEARED,
    (payload: { reset: IApplicationResetCarrier }) => ({ payload }),
);

/**
 * A navigation left the workspace or cleared the open report (the router saga's decision). On top
 * of the application reset it resets `data.dateDatasets` and clears the undo history
 * (store/_infra/time_travel.ts keys on this event).
 */
export const wholeApplicationReset = createAction(
    ApplicationResetActionTypeKeys.STORE_WHOLE_APPLICATION_RESET,
    (payload: { reset: IApplicationResetCarrier }) => ({ payload }),
);

export type ApplicationResetAction =
    | ReturnType<typeof applicationCleared>
    | ReturnType<typeof wholeApplicationReset>
    | IOpenReportFailedAction
    | IDeleteReportFinishedAction;

export type InsightContentResetAction = ReturnType<typeof insightContentCleared> | ApplicationResetAction;

/**
 * Every action that performs the APPLICATION-RESET scope. A slice case matched by this resets the
 * value it owns (report leaves, insight meta, visualization class, dashboards usage) — plus
 * everything {@link isInsightContentResetEvent} covers.
 */
export function isApplicationResetEvent(action: Action): action is ApplicationResetAction {
    if (applicationCleared.match(action) || wholeApplicationReset.match(action)) {
        return true;
    }
    if (openReportFailed.match(action)) {
        return true;
    }
    // the delete saga attaches the carrier exactly when the deleted report is the open one
    return deleteReportFinished.match(action) && action.payload.reset !== undefined;
}

/**
 * Every action that performs the INSIGHT-CONTENT-CLEAR scope (the application resets imply it).
 */
export function isInsightContentResetEvent(action: Action): action is InsightContentResetAction {
    return insightContentCleared.match(action) || isApplicationResetEvent(action);
}

/** The carrier of a matched insight-content reset (see {@link isInsightContentResetEvent}). */
export function insightContentResetCarrierOf(action: InsightContentResetAction): IInsightContentResetCarrier {
    // every member of the union carries `reset`; deleteReportFinished carries it optionally, but
    // the matcher only admits it when present
    return (action.payload as { reset: IInsightContentResetCarrier }).reset;
}

/** The carrier of a matched application reset (see {@link isApplicationResetEvent}). */
export function applicationResetCarrierOf(action: ApplicationResetAction): IApplicationResetCarrier {
    return (action.payload as { reset: IApplicationResetCarrier }).reset;
}
