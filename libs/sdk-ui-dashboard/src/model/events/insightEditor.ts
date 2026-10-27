// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";

import { type InsightEditorTarget } from "../types/insightEditorTypes.js";

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link IDashboardInsightEditorOpened} event.
 *
 * @alpha
 */
export interface IDashboardInsightEditorOpenedPayload {
    readonly target: InsightEditorTarget;
}

/**
 * This event is emitted when the embedded Analytical Designer opens.
 *
 * @alpha
 */
export interface IDashboardInsightEditorOpened extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_EDITOR.OPENED";
    readonly payload: IDashboardInsightEditorOpenedPayload;
}

/**
 * Creates the {@link IDashboardInsightEditorOpened} event.
 *
 * @alpha
 */
export function insightEditorOpened(
    target: InsightEditorTarget,
    correlationId?: string,
): DashboardEventBody<IDashboardInsightEditorOpened> {
    return {
        type: "GDC.DASH/EVT.INSIGHT_EDITOR.OPENED",
        correlationId,
        payload: { target },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightEditorOpened}.
 *
 * @alpha
 */
export const isDashboardInsightEditorOpened = eventGuard<IDashboardInsightEditorOpened>(
    "GDC.DASH/EVT.INSIGHT_EDITOR.OPENED",
);

/**
 * Payload of the {@link IDashboardInsightEditorInsightSaved} event.
 *
 * @alpha
 */
export interface IDashboardInsightEditorInsightSavedPayload {
    readonly target: InsightEditorTarget;
    readonly insight: IInsight;
}

/**
 * This event is emitted when the user saves the insight in the embedded Analytical Designer. The
 * editor closes.
 *
 * @alpha
 */
export interface IDashboardInsightEditorInsightSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_EDITOR.INSIGHT_SAVED";
    readonly payload: IDashboardInsightEditorInsightSavedPayload;
}

/**
 * Creates the {@link IDashboardInsightEditorInsightSaved} event.
 *
 * @alpha
 */
export function insightEditorInsightSaved(
    target: InsightEditorTarget,
    insight: IInsight,
    correlationId?: string,
): DashboardEventBody<IDashboardInsightEditorInsightSaved> {
    return {
        type: "GDC.DASH/EVT.INSIGHT_EDITOR.INSIGHT_SAVED",
        correlationId,
        payload: { target, insight },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightEditorInsightSaved}.
 *
 * @alpha
 */
export const isDashboardInsightEditorInsightSaved = eventGuard<IDashboardInsightEditorInsightSaved>(
    "GDC.DASH/EVT.INSIGHT_EDITOR.INSIGHT_SAVED",
);

/**
 * Payload of the {@link IDashboardInsightEditorCancelled} event.
 *
 * @alpha
 */
export interface IDashboardInsightEditorCancelledPayload {
    readonly target: InsightEditorTarget;
}

/**
 * This event is emitted when the user leaves the embedded Analytical Designer without saving. The
 * editor closes.
 *
 * @alpha
 */
export interface IDashboardInsightEditorCancelled extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_EDITOR.CANCELLED";
    readonly payload: IDashboardInsightEditorCancelledPayload;
}

/**
 * Creates the {@link IDashboardInsightEditorCancelled} event.
 *
 * @alpha
 */
export function insightEditorCancelled(
    target: InsightEditorTarget,
    correlationId?: string,
): DashboardEventBody<IDashboardInsightEditorCancelled> {
    return {
        type: "GDC.DASH/EVT.INSIGHT_EDITOR.CANCELLED",
        correlationId,
        payload: { target },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightEditorCancelled}.
 *
 * @alpha
 */
export const isDashboardInsightEditorCancelled = eventGuard<IDashboardInsightEditorCancelled>(
    "GDC.DASH/EVT.INSIGHT_EDITOR.CANCELLED",
);

/**
 * Payload of the {@link IDashboardInsightEditorCacheResetRequested} event.
 *
 * @alpha
 */
export interface IDashboardInsightEditorCacheResetRequestedPayload {
    /**
     * `catalogs` asks to reset the catalog caches, `all` asks to reset every cache.
     */
    readonly scope: "all" | "catalogs";
}

/**
 * This event is emitted when the embedded Analytical Designer needs fresh data from a caching
 * backend, for example after the user edits a metric. A host that gives the dashboard a caching
 * backend resets its caches when it receives the event.
 *
 * @alpha
 */
export interface IDashboardInsightEditorCacheResetRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT_EDITOR.CACHE_RESET_REQUESTED";
    readonly payload: IDashboardInsightEditorCacheResetRequestedPayload;
}

/**
 * Creates the {@link IDashboardInsightEditorCacheResetRequested} event.
 *
 * @alpha
 */
export function insightEditorCacheResetRequested(
    scope: "all" | "catalogs",
    correlationId?: string,
): DashboardEventBody<IDashboardInsightEditorCacheResetRequested> {
    return {
        type: "GDC.DASH/EVT.INSIGHT_EDITOR.CACHE_RESET_REQUESTED",
        correlationId,
        payload: { scope },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightEditorCacheResetRequested}.
 *
 * @alpha
 */
export const isDashboardInsightEditorCacheResetRequested =
    eventGuard<IDashboardInsightEditorCacheResetRequested>(
        "GDC.DASH/EVT.INSIGHT_EDITOR.CACHE_RESET_REQUESTED",
    );
