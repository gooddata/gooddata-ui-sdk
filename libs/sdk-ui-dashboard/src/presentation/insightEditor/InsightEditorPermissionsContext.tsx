// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectEnableInsightEditing } from "../../model/store/config/configSelectors.js";

import { type InsightPermissionsById, useInsightEditPermissions } from "./useInsightEditPermissions.js";

const InsightEditorPermissionsContext = createContext<InsightPermissionsById | undefined>(undefined);

/**
 * Loads the permissions of the user on the dashboard visualizations once for all widget menus.
 */
export function InsightEditorPermissionsProvider({ children }: { children?: ReactNode }) {
    const isEnabled = useDashboardSelector(selectEnableInsightEditing);
    const permissions = useInsightEditPermissions(isEnabled);
    return (
        <InsightEditorPermissionsContext.Provider value={permissions}>
            {children}
        </InsightEditorPermissionsContext.Provider>
    );
}

export function useInsightEditorPermissions(): InsightPermissionsById | undefined {
    return useContext(InsightEditorPermissionsContext);
}
