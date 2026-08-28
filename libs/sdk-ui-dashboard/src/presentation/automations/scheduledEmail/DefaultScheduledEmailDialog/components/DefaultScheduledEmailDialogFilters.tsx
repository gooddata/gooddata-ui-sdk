// (C) 2026 GoodData Corporation

import { AutomationFiltersSelect } from "../../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { type IScheduledEmailDialogFiltersProps } from "../../types.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";

/**
 * Default render of the scheduled-export dialog's filters region: the filter and parameter chips of
 * the Filters tab, flat or per dashboard tab. The title is hidden and the list always expanded
 * because the tab itself provides both. Props-driven — reads no context. The default dialog and
 * {@link ScheduledEmailDialogFilters} render it with {@link useScheduledEmailDialogFiltersProps}; a
 * `slots.Filters` slot receives it as `Default`.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogFilters(props: IScheduledEmailDialogFiltersProps) {
    return (
        <AutomationFiltersSelect
            {...props}
            overlayPositionType={OVERLAY_POSITION_TYPE}
            hideTitle
            showAllFilters
        />
    );
}
