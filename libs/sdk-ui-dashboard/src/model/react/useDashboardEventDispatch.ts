// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { DashboardEvents } from "../events";
import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Convenience hook for dispatching Dashboard events.
 *
 * @returns function that you can use to dispatch Dashboard events
 * @alpha
 */
export const useDashboardEventDispatch = (): ((event: DashboardEvents) => void) => {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (event: DashboardEvents) => {
            dispatch(event);
        },
        [dispatch],
    );
};
