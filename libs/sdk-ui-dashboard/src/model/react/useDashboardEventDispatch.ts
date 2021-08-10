// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import invariant from "ts-invariant";

import { DashboardEvents, ICustomDashboardEvent, isDashboardEventOrCustomDashboardEvent } from "../events";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Convenience hook for dispatching Dashboard events.
 *
 * @returns function that you can use to dispatch Dashboard events
 * @alpha
 */
export const useDashboardEventDispatch = (): ((event: DashboardEvents | ICustomDashboardEvent) => void) => {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (event: DashboardEvents | ICustomDashboardEvent) => {
            invariant(
                isDashboardEventOrCustomDashboardEvent(event),
                "Unsupported event passed to useDashboardEventDispatch result.",
            );
            dispatch(event);
        },
        [dispatch],
    );
};
