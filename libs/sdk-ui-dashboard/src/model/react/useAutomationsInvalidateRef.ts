// (C) 2025 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useDashboardDispatch } from "./DashboardStoreProvider.js";
import { uiActions } from "../store/ui/index.js";

/**
 * Provides a callback to dispatch with the invalidation callback function.
 * The callback is populated by the Automations component
 * so it can be invoked from anywhere in the dashboard.
 *
 * @returns A callback to dispatch with the invalidation function
 * @alpha
 */
export const useAutomationsInvalidateRef = () => {
    const dispatch = useDashboardDispatch();

    const onInvalidateCallbackChange = useCallback(
        (callback: (() => void) | undefined) => {
            dispatch(uiActions.setAutomationsInvalidateCallback(callback));
        },
        [dispatch],
    );

    useEffect(() => {
        return () => {
            dispatch(uiActions.setAutomationsInvalidateCallback(undefined));
        };
    }, [dispatch]);

    return { onInvalidateCallbackChange };
};
