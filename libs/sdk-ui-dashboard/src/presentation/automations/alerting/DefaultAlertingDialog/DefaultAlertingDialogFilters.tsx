// (C) 2026 GoodData Corporation

import { AutomationFiltersSelect } from "../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { type IAlertingDialogFiltersProps } from "../types.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const noop = () => {};

/**
 * Default render of the alerting dialog's filters region: the filter and parameter chips above the
 * form. Props-driven — reads no context. The default dialog and {@link AlertingDialogFilters} render
 * it with {@link useAlertingDialogFiltersProps}; a `slots.Filters` slot receives it as `Default`.
 * Alert automations always store their filters and never target the whole dashboard, so the
 * store-filters contract is fixed here instead of being carried on the region props.
 *
 * @alpha
 */
export function DefaultAlertingDialogFilters(props: IAlertingDialogFiltersProps) {
    return (
        <AutomationFiltersSelect
            {...props}
            storeFilters
            onStoreFiltersChange={noop}
            isDashboardAutomation={false}
            overlayPositionType={OVERLAY_POSITION_TYPE}
        />
    );
}
