// (C) 2026 GoodData Corporation

import { type IVisualizationClass } from "@gooddata/sdk-model";

/**
 * The recomputed values an application-reset event carries. The design is explained in
 * store/app_context/application_reset_events.ts; the types live here because the reset-capable
 * action CREATORS need them and the events module needs the creators.
 *
 * Two reset targets are RECOMPUTED rather than reset to a constant, and neither recomputation
 * belongs in a reducer: a fresh `sessionId` is impure (uuid), and the default visualization class
 * is derived from a FOREIGN domain value (`data.visualizationClasses`). Both ride on the event,
 * built at the dispatch boundary.
 */
export interface IInsightContentResetCarrier {
    /** The refreshed `appState.sessionId` — every reset scope refreshes it. */
    sessionId: string;
}

export interface IApplicationResetCarrier extends IInsightContentResetCarrier {
    /** The re-defaulted `data.visualizationClass` (`getDefaultVisualizationClass ?? null`). */
    defaultVisualizationClass: IVisualizationClass | null;
}
