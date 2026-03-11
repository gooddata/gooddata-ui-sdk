// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { DASHBOARD_DENSITY_LOCAL_STORAGE_KEY } from "../../../model/commandHandlers/density/changeDashboardDensityHandler.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { isSupportedDashboardDensity } from "../../../types.js";

/**
 * Reads the density setting from theme and localStorage on mount and sets it in the store.
 *
 * Priority: localStorage (user preference) > theme.dashboards.density > "comfortable"
 *
 * @internal
 */
export function DensityInitializer() {
    const theme = useTheme();
    const dispatch = useDashboardDispatch();
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    useEffect(() => {
        // do not allow compact density in edit mode
        if (isEditMode) {
            dispatch(uiActions.setDensity("comfortable"));
            return;
        }
        // User's localStorage preference takes priority over the theme default.
        try {
            const stored = localStorage.getItem(DASHBOARD_DENSITY_LOCAL_STORAGE_KEY);
            if (isSupportedDashboardDensity(stored)) {
                dispatch(uiActions.setDensity(stored));
                return;
            }
        } catch {
            // Ignore localStorage errors (e.g. private browsing mode)
        }

        // fallback to theme density setting
        const themeDensity = theme?.dashboards?.density;
        dispatch(uiActions.setDensity(themeDensity ?? "comfortable"));
    }, [theme, dispatch, isEditMode]);

    return null;
}
