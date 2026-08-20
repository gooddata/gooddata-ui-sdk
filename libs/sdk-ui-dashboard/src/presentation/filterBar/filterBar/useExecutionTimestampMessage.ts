// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type ILocale } from "@gooddata/sdk-ui";

import { changeIgnoreExecutionTimestamp } from "../../../model/commands/dashboard.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectLocale, selectTimezone } from "../../../model/store/config/configSelectors.js";
import { selectEffectiveDashboardTimezone } from "../../../model/store/meta/metaSelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";

/**
 * Formats a date using the provided locale and timezone from backend settings,
 * explicitly avoiding browser timezone settings to ensure consistent display
 * regardless of the user's device configuration.
 */
function formatDate(isoString: string | undefined, locale: ILocale, timezone?: string) {
    if (!isoString) {
        return undefined;
    }

    // Parse the ISO string and create Date object only once
    const timestamp = new Date(isoString);

    // IMPORTANT: We use Intl.DateTimeFormat with explicit timeZone parameter
    // to ensure we only rely on backend settings and not the browser's timezone
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: timezone || "UTC",
    });

    // Using the same approach for time to maintain consistency across browser environments
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || "UTC",
    });

    const formattedDate = dateFormatter.format(timestamp);
    const formattedTime = timeFormatter.format(timestamp);

    return `${formattedDate}, ${formattedTime}`;
}

export const useExecutionTimestampMessage = () => {
    const locale = useDashboardSelector(selectLocale);
    // the custom dashboard timezone (view-mode override or dashboard configuration) wins over
    // the workspace setting so the displayed timestamp matches the rest of the dashboard
    const workspaceTimezone = useDashboardSelector(selectTimezone);
    const customTimezone = useDashboardSelector(selectEffectiveDashboardTimezone);
    const timezone = customTimezone ?? workspaceTimezone;
    const dashboardExecutionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const showExecutionTimestampMessage = dashboardExecutionTimestamp !== undefined;
    const formattedDate = formatDate(dashboardExecutionTimestamp, locale, timezone);

    const dispatch = useDashboardDispatch();

    const onShowCurrentTimestampDashboard = useCallback(() => {
        dispatch(changeIgnoreExecutionTimestamp(true));
    }, [dispatch]);

    return {
        showExecutionTimestampMessage,
        formattedDate,
        onShowCurrentTimestampDashboard,
    };
};
