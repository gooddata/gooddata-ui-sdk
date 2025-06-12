// (C) 2025 GoodData Corporation

import { ILocale } from "@gooddata/sdk-ui";
import { useCallback } from "react";
import {
    selectLocale,
    selectExecutionTimestamp,
    useDashboardDispatch,
    useDashboardSelector,
    changeIgnoreExecutionTimestamp,
    selectTimezone,
} from "../../../model/index.js";

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
    const timezone = useDashboardSelector(selectTimezone);
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
