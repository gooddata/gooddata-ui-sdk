// (C) 2025 GoodData Corporation

import { ILocale } from "@gooddata/sdk-ui";
import { useCallback } from "react";
import { toModifiedISOStringToTimezone } from "../../scheduledEmail/utils/date.js";
import {
    selectLocale,
    selectExecutionTimestamp,
    useDashboardDispatch,
    useDashboardSelector,
    changeIgnoreExecutionTimestamp,
    selectTimezone,
} from "../../../model/index.js";

function formatDate(isoString: string | undefined, locale: ILocale, timezone?: string) {
    if (!isoString) {
        return undefined;
    }

    const { date } = toModifiedISOStringToTimezone(new Date(isoString), timezone);

    const formattedDate = date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });

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
