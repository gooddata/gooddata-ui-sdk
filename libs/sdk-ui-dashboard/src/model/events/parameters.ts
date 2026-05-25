// (C) 2026 GoodData Corporation

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * This event is emitted after dashboard parameter runtime values have been reset on the active tab.
 *
 * @alpha
 */
export interface IDashboardParametersSelectionReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET";
}

/**
 * @alpha
 */
export function parametersSelectionReset(
    correlationId?: string,
): DashboardEventBody<IDashboardParametersSelectionReset> {
    return {
        type: "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardParametersSelectionReset}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardParametersSelectionReset = eventGuard<IDashboardParametersSelectionReset>(
    "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET",
);
