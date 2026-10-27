// (C) 2026 GoodData Corporation

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectEnableInsightEditing, selectSettings } from "../../model/store/config/configSelectors.js";
import { selectCanCreateVisualization } from "../../model/store/permissions/permissionsSelectors.js";

/**
 * Tells whether the user can create a new insight in the embedded Analytical Designer.
 */
export function useCanCreateInsightInEditor(): boolean {
    const isEnabled = useDashboardSelector(selectEnableInsightEditing);
    const settings = useDashboardSelector(selectSettings);
    const canCreateVisualization = useDashboardSelector(selectCanCreateVisualization);
    const isNewInsightEnabled = settings?.["enableKPIDashboardNewInsight"] ?? true;
    return isEnabled && !!isNewInsightEnabled && canCreateVisualization;
}
