// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectScheduleEmailDialogReturnFocusTo } from "../../../model/store/ui/uiSelectors.js";

export const useScheduleEmailDialogAccessibility = () => {
    const emailDialogReturnFocusTo = useDashboardSelector(selectScheduleEmailDialogReturnFocusTo);

    const returnFocusTo = useMemo(
        () => emailDialogReturnFocusTo || DEFAULT_MENU_BUTTON_ID,
        [emailDialogReturnFocusTo],
    );

    return {
        returnFocusTo,
    };
};
