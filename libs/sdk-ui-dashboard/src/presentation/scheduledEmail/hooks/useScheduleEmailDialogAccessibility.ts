// (C) 2025 GoodData Corporation

import { useMemo } from "react";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { selectScheduleEmailDialogOpenedFrom, useDashboardSelector } from "../../../model/index.js";
import {
    DASHBOARD_INSIGHT_MENU_BUTTON_ID,
    DEFAULT_MENU_BUTTON_ID,
} from "../../../_staging/accessibility/elementId.js";

export const useScheduleEmailDialogAccessibility = () => {
    const scheduleEmailId = useIdPrefixed("ScheduleEmail");
    const scheduleEmailingDialogOpenedFrom = useDashboardSelector(selectScheduleEmailDialogOpenedFrom);
    const isOpenedFromWidget = scheduleEmailingDialogOpenedFrom === "widget";

    const returnFocusTo = useMemo(
        () => (isOpenedFromWidget ? DASHBOARD_INSIGHT_MENU_BUTTON_ID : DEFAULT_MENU_BUTTON_ID),
        [isOpenedFromWidget],
    );

    return {
        scheduleEmailId,
        returnFocusTo,
    };
};
