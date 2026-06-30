// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { DEFAULT_MENU_BUTTON_ID } from "../../../../_staging/accessibility/elementId.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

export const useScheduleEmailDialogAccessibility = () => {
    const { scheduleEmailDialogReturnFocusTo } = useAutomationsContext();

    const returnFocusTo = useMemo(
        () => scheduleEmailDialogReturnFocusTo || DEFAULT_MENU_BUTTON_ID,
        [scheduleEmailDialogReturnFocusTo],
    );

    return {
        returnFocusTo,
    };
};
