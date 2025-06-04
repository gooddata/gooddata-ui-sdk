// (C) 2025 GoodData Corporation

import { selectScheduleEmailDialogReturnFocusTo, useDashboardSelector } from "../../../model/index.js";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import { useMemo } from "react";

export const useScheduleEmailDialogAccessibility = () => {
    const emailDialogReturnFocusTo = useDashboardSelector(selectScheduleEmailDialogReturnFocusTo);

    const returnFocusTo = useMemo(
        () => (emailDialogReturnFocusTo ? emailDialogReturnFocusTo : DEFAULT_MENU_BUTTON_ID),
        [emailDialogReturnFocusTo],
    );

    return {
        returnFocusTo,
    };
};
