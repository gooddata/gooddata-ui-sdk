// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectAlertingDialogReturnFocusTo } from "../../../model/store/ui/uiSelectors.js";

export const useAlertingDialogAccessibility = () => {
    const alertingDialogReturnFocusTo = useDashboardSelector(selectAlertingDialogReturnFocusTo);

    const returnFocusTo = useMemo(
        () => alertingDialogReturnFocusTo || DEFAULT_MENU_BUTTON_ID,
        [alertingDialogReturnFocusTo],
    );

    return {
        returnFocusTo,
    };
};
