// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { resolveDashboardTimezoneInfo } from "./resolveDashboardTimezoneInfo.js";
import { type ITimezoneIndicatorProps } from "./types.js";

/**
 * Read-only indicator of the time zone effective on the dashboard, shown in the top bar.
 *
 * The badge label is the friendly timezone name only (e.g. "Prague"); the hover tooltip shows
 * a generic "Time zone" label. The full timezone info is available via
 * {@link ITimezoneIndicatorProps.timezone} for custom renderings. Screen readers get an sr-only
 * "Time zone: " prefix instead of the tooltip.
 *
 * @alpha
 */
export function TimezoneIndicator({
    timezoneConfig,
    defaultTimezone,
    timezone,
}: ITimezoneIndicatorProps): ReactElement | null {
    const intl = useIntl();

    if (!timezoneConfig?.showTimezoneInfo) {
        return null;
    }

    const resolvedTimezone = timezone ?? resolveDashboardTimezoneInfo(timezoneConfig, defaultTimezone);
    if (!resolvedTimezone) {
        return null;
    }

    const { name } = resolvedTimezone;

    return (
        <div className="s-timezone-indicator gd-timezone-indicator">
            <UiTooltip
                arrowPlacement="top-start"
                content={intl.formatMessage({ id: "topBar.timezoneIndicator.tooltip" })}
                triggerBy={["hover"]}
                anchor={
                    <div className="gd-timezone-indicator-content">
                        <i aria-hidden="true" className="gd-timezone-indicator-icon" />
                        <span className="sr-only">
                            <FormattedMessage id="topBar.timezoneIndicator.label" />
                        </span>
                        <span>{name}</span>
                    </div>
                }
            />
        </div>
    );
}
