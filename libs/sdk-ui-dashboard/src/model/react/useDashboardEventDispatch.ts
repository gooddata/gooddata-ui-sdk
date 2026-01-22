// (C) 2020-2026 GoodData Corporation

import { useCallback } from "react";

import { invariant } from "ts-invariant";

import { useDashboardDispatch } from "./DashboardStoreProvider.js";
import { triggerEvent } from "../commands/events.js";
import {
    type DashboardEventBody,
    type ICustomDashboardEvent,
    isDashboardEventOrCustomDashboardEvent,
} from "../events/base.js";
import { type DashboardEvents } from "../events/index.js";

/**
 * Convenience hook for dispatching Dashboard events.
 *
 * @returns function that you can use to dispatch Dashboard events
 * @alpha
 */
export const useDashboardEventDispatch = (): ((
    eventBody: DashboardEventBody<DashboardEvents | ICustomDashboardEvent>,
) => void) => {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (eventBody: DashboardEventBody<DashboardEvents | ICustomDashboardEvent>) => {
            invariant(
                isDashboardEventOrCustomDashboardEvent(eventBody),
                "Unsupported event passed to useDashboardEventDispatch result.",
            );
            const command = triggerEvent(eventBody);
            dispatch(command);
        },
        [dispatch],
    );
};
