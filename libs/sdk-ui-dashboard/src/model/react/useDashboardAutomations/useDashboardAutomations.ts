// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import {
    initializeAutomations as initializeAutomationsCommand,
    refreshAutomations as refreshAutomationsCommand,
} from "../../commands/index.js";
import { selectEnableAutomations } from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";

/**
 * @alpha
 */
export const useDashboardAutomations = () => {
    const dispatch = useDashboardDispatch();

    // Feature Flags
    const enableAutomations = useDashboardSelector(selectEnableAutomations);

    // Data initialization
    const initializeAutomations = useCallback(() => {
        if (enableAutomations) {
            dispatch(initializeAutomationsCommand());
        }
    }, [dispatch, enableAutomations]);

    // Data Reload
    const refreshAutomations = useCallback(() => {
        if (enableAutomations) {
            dispatch(refreshAutomationsCommand());
        }
    }, [dispatch, enableAutomations]);

    return {
        refreshAutomations,
        initializeAutomations,
    };
};
