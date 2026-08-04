// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectEnableDashboardTimezone } from "../../../model/store/config/configSelectors.js";
import { selectIsInViewMode } from "../../../model/store/renderMode/renderModeSelectors.js";

import { TimezoneIndicator } from "./TimezoneIndicator.js";
import { type ITimezoneIndicatorProps } from "./types.js";

/**
 * Renders the time zone indicator only when the dashboard timezone feature is enabled
 * and the dashboard is in view mode.
 *
 * @alpha
 */
export function DefaultTimezoneIndicator(props: ITimezoneIndicatorProps): ReactElement | null {
    const enableDashboardTimezone = useDashboardSelector(selectEnableDashboardTimezone);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    if (!enableDashboardTimezone || !isInViewMode) {
        return null;
    }
    return <TimezoneIndicator {...props} />;
}
