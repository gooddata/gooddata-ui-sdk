// (C) 2026 GoodData Corporation

import { AutomationFiltersSelect } from "../../shared/automationFilters/components/AutomationFiltersSelect.js";
import { type IAlertingDialogFiltersProps } from "../types.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const noop = () => {};

/**
 * Default implementation of the alerting dialog's filters region. Alert automations always store
 * their filters and never target the whole dashboard, so the store-filters contract is fixed here
 * instead of being carried on the region props.
 */
export function AlertingDialogFilters(props: IAlertingDialogFiltersProps) {
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
