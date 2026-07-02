// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import {
    initializeAutomations as initializeAutomationsCommand,
    refreshAutomations as refreshAutomationsCommand,
} from "../../commands/scheduledEmail.js";
import { uiActions } from "../../store/ui/index.js";
import { useDashboardDispatch } from "../DashboardStoreProvider.js";

/**
 * @alpha
 */
export const useDashboardAutomations = () => {
    const dispatch = useDashboardDispatch();

    // Data initialization
    const initializeAutomations = useCallback(() => {
        dispatch(initializeAutomationsCommand());
    }, [dispatch]);

    // Data Reload
    const refreshAutomations = useCallback(() => {
        dispatch(refreshAutomationsCommand());
    }, [dispatch]);

    const refreshAutomationManagementItems = useCallback(() => {
        dispatch(uiActions.invalidateAutomationItems());
    }, [dispatch]);

    return {
        refreshAutomations,
        initializeAutomations,
        refreshAutomationManagementItems,
    };
};
