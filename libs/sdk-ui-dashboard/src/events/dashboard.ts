// (C) 2021 GoodData Corporation

import { IDashboard } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import { DashboardContext } from "../dashboard/state";

/**
 * @internal
 */
export type DashboardEventType = "GDC.EVT.DASHBOARD.LOADED";

/**
 * Base type for all dashboard events.
 *
 * @internal
 */
export interface IDashboardEvent {
    /**
     * Event type. Always starts with "GDC.EVT".
     */
    readonly type: DashboardEventType;

    /**
     * If this event was triggered as part of a command processing, then the prop will contain command's correlation ID.
     */
    readonly correlationId?: string;

    /**
     * Dashboard context in which the event occurred.
     */
    readonly ctx: DashboardContext;
}

//
//
//

/**
 * This event is emitted when a dashboard is successfully loaded. It contains contextual information and then
 * the dashboard.
 *
 * @internal
 */
export interface DashboardLoaded extends IDashboardEvent {
    type: "GDC.EVT.DASHBOARD.LOADED";
    payload: {
        /**
         * Loaded dashboard.
         */
        dashboard: IDashboard;

        /**
         * Insights used on the dashboard.
         */
        insights: IInsight[];
    };
}

/**
 *
 * @param ctx
 * @param dashboard
 * @param insights
 *
 */
export function dashboardLoaded(
    ctx: DashboardContext,
    dashboard: IDashboard,
    insights: IInsight[],
): DashboardLoaded {
    return {
        type: "GDC.EVT.DASHBOARD.LOADED",
        ctx,
        payload: {
            dashboard,
            insights,
        },
    };
}

//
//
//

/**
 * @internal
 */
export type DashboardEvents = DashboardLoaded;
