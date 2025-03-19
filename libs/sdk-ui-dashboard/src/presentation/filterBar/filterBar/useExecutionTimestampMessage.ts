// (C) 2025 GoodData Corporation

import { ILocale } from "@gooddata/sdk-ui";
import {
    selectLocale,
    selectExecutionTimestamp,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { useCallback } from "react";

function formatDate(isoString: string | undefined, locale: ILocale) {
    if (!isoString) {
        return undefined;
    }

    const date = new Date(isoString);

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
    const dashboardExecutionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const showExecutionTimestampMessage = dashboardExecutionTimestamp !== undefined;
    const formattedDate = formatDate(dashboardExecutionTimestamp, locale);

    const dispatch = useDashboardDispatch();

    const onShowCurrentTimestampDashboard = useCallback(() => {
        dispatch(uiActions.ignoreExecutionTimestamp());
    }, [dispatch]);

    return {
        showExecutionTimestampMessage,
        formattedDate,
        onShowCurrentTimestampDashboard,
    };
};
