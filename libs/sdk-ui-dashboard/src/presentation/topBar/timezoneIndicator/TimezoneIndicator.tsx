// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { resolveDashboardTimezoneInfo } from "./resolveDashboardTimezoneInfo.js";
import { type ITimezoneIndicatorProps } from "./types.js";

/**
 * Read-only indicator of the time zone effective on the dashboard, shown in the top bar.
 *
 * The badge label is the friendly timezone name only (e.g. "Prague"); the UTC offset is shown
 * only in the hover tooltip and is available via {@link ITimezoneIndicatorProps.timezone} for
 * custom renderings.
 *
 * @alpha
 */
export function TimezoneIndicator({
    timezoneConfig,
    defaultTimezone,
    timezone,
}: ITimezoneIndicatorProps): ReactElement | null {
    if (!timezoneConfig?.showTimezoneInfo) {
        return null;
    }

    const resolvedTimezone = timezone ?? resolveDashboardTimezoneInfo(timezoneConfig, defaultTimezone);
    if (!resolvedTimezone) {
        return null;
    }

    const { name, offsetLabel } = resolvedTimezone;

    return (
        <div className="s-timezone-indicator gd-timezone-indicator">
            <BubbleHoverTrigger>
                <div className="gd-timezone-indicator-content">
                    <i aria-hidden="true" className="gd-timezone-indicator-icon" />
                    {name}
                </div>
                <Bubble alignPoints={[{ align: "bc tc" }]} alignTo=".gd-timezone-indicator-icon">
                    <FormattedMessage
                        id="topBar.timezoneIndicator.tooltip"
                        values={{ name, offset: offsetLabel }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
