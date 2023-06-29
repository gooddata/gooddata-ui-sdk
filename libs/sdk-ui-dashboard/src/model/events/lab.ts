// (C) 2021-2023 GoodData Corporation

import { DashboardEventBody, IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

// FIXME  this should be reworked in the RAIL-4834

/**
 * This event is emitted when the create button is clicked.
 *
 * @internal
 */
export interface CreateInsightRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED";
}

/**
 * Create {@link CreateInsightRequested} event
 *
 * @internal
 */
export function createInsightRequested(correlationId?: string): DashboardEventBody<CreateInsightRequested> {
    return {
        type: "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link CreateInsightRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isCreateInsightRequested = eventGuard<CreateInsightRequested>(
    "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED",
);
