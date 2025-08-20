// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import { selectScheduleEmailDialogReturnFocusTo, useDashboardSelector } from "../../../model/index.js";

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
