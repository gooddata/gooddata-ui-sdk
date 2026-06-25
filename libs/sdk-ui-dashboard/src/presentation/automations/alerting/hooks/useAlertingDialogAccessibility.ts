// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../../_staging/accessibility/elementId.js";
import { useAlertingManagementDialogContext } from "../../contexts/AlertingManagementDialogContext.js";

export const useAlertingDialogAccessibility = () => {
    const { alertingDialogReturnFocusTo } = useAlertingManagementDialogContext();

    const returnFocusTo = useMemo(
        () => alertingDialogReturnFocusTo || DEFAULT_MENU_BUTTON_ID,
        [alertingDialogReturnFocusTo],
    );

    return {
        returnFocusTo,
    };
};
