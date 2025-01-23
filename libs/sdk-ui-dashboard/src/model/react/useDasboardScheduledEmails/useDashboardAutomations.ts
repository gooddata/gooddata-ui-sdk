// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import {
    selectAutomationsIsInitialized,
    selectAutomationsIsLoading,
    selectEnableAutomations,
} from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";
import {
    refreshAutomations as refreshAutomationsCommand,
    initializeAutomations as initializeAutomationsCommand,
} from "../../commands/index.js";

/**
 *
 * @alpha
 */
export const useDashboardAutomations = () => {
    const dispatch = useDashboardDispatch();

    // Feature Flags
    const enableAutomations = useDashboardSelector(selectEnableAutomations);
    const isInitialized = useDashboardSelector(selectAutomationsIsInitialized);
    const isLoading = useDashboardSelector(selectAutomationsIsLoading);

    // Data initialization
    const initializeAutomations = useCallback(() => {
        if (enableAutomations && !isInitialized && !isLoading) {
            dispatch(initializeAutomationsCommand());
        }
    }, [dispatch, enableAutomations, isInitialized, isLoading]);

    // Data Reload
    const refreshAutomations = useCallback(() => {
        if (enableAutomations) {
            dispatch(refreshAutomationsCommand());
        }
    }, [dispatch, enableAutomations]);

    return {
        isInitialized,
        isLoading,
        refreshAutomations,
        initializeAutomations,
    };
};
