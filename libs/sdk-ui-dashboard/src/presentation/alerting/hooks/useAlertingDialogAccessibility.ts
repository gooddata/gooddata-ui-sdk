// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import { selectAlertingDialogReturnFocusTo, useDashboardSelector } from "../../../model/index.js";

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
