// (C) 2021-2026 GoodData Corporation

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

// FIXME  this should be reworked in the RAIL-4834

/**
 * This event is emitted when the create button is clicked.
 *
 * @internal
 */
export interface ICreateInsightRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED";
}

/**
 * Create {@link ICreateInsightRequested} event
 *
 * @internal
 */
export function createInsightRequested(correlationId?: string): DashboardEventBody<ICreateInsightRequested> {
    return {
        type: "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link ICreateInsightRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isCreateInsightRequested = eventGuard<ICreateInsightRequested>(
    "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED",
);
