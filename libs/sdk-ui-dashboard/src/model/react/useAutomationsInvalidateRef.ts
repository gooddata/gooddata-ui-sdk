// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { useDashboardDispatch } from "./DashboardStoreProvider.js";
import { uiActions } from "../store/ui/index.js";

/**
 * Creates and registers a ref for invalidating automations from outside the Automation embedded component.

 * @returns The ref object that gets populated by the Automations component
 * @alpha
 */
export const useAutomationsInvalidateRef = () => {
    const invalidateItemsRef = useRef<() => void>(() => {});
    const dispatch = useDashboardDispatch();

    useEffect(() => {
        // Store the ref so other components can trigger invalidation
        dispatch(uiActions.setAutomationsInvalidateRef(invalidateItemsRef));

        // Cleanup - remove ref from store when component unmounts
        return () => {
            dispatch(uiActions.setAutomationsInvalidateRef(undefined));
        };
    }, [dispatch, invalidateItemsRef]);

    return invalidateItemsRef;
};
