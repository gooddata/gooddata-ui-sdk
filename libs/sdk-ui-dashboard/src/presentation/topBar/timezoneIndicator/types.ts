// (C) 2026 GoodData Corporation

import { type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

/**
 * Resolved timezone information effective on the dashboard.
 *
 * @alpha
 */
export interface IDashboardTimezoneInfo {
    /**
     * Concrete IANA timezone ID (e.g. "Europe/Prague"); the browser-detected sentinel is already
     * resolved.
     */
    timezoneId: string;

    /**
     * Friendly timezone name (e.g. "Prague"). This is the only value the default indicator shows
     * in its badge label.
     */
    name: string;

    /**
     * UTC offset label (e.g. "GMT+02:00"). The default indicator does NOT show the offset in the
     * badge label — it only appears in the hover tooltip. The value is provided so that custom
     * top bar / indicator renderings can display it.
     */
    offsetLabel: string;
}

/**
 * @alpha
 */
export interface ITimezoneIndicatorProps {
    /**
     * Dashboard timezone configuration driving the indicator visibility.
     */
    timezoneConfig?: IDashboardTimezoneConfig;

    /**
     * Effective workspace/organization timezone used when
     * {@link ITimezoneIndicatorProps.timezoneConfig} does not define an explicit timezone ID.
     */
    defaultTimezone?: string;

    /**
     * Resolved timezone information. The default indicator renders only
     * {@link IDashboardTimezoneInfo.name} in the badge; {@link IDashboardTimezoneInfo.offsetLabel}
     * is shown in the tooltip and exposed here for custom renderings. When not provided, the
     * indicator resolves the information from {@link ITimezoneIndicatorProps.timezoneConfig} and
     * {@link ITimezoneIndicatorProps.defaultTimezone}.
     */
    timezone?: IDashboardTimezoneInfo;
}
