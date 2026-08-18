// (C) 2026 GoodData Corporation

import { AutomationFiltersSelect } from "../../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { type IScheduledEmailDialogFiltersProps } from "../../types.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";

/**
 * Default implementation of the scheduled email dialog's Filters tab content. The title is
 * hidden and the list always expanded because the tab itself provides both.
 */
export function ScheduledEmailDialogFilters(props: IScheduledEmailDialogFiltersProps) {
    return (
        <AutomationFiltersSelect
            {...props}
            overlayPositionType={OVERLAY_POSITION_TYPE}
            hideTitle
            showAllFilters
        />
    );
}
