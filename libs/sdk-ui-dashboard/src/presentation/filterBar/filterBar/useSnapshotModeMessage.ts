// (C) 2025 GoodData Corporation

import { ILocale } from "@gooddata/sdk-ui";
import {
    selectLocale,
    selectSnapshotTime,
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

export const useSnapshotModeMessage = () => {
    const locale = useDashboardSelector(selectLocale);
    const dashboardSnapshotTime = useDashboardSelector(selectSnapshotTime);
    const showSnapshotModeMessage = dashboardSnapshotTime !== undefined;
    const formattedDate = formatDate(dashboardSnapshotTime, locale);

    const dispatch = useDashboardDispatch();

    const onShowLiveDashboard = useCallback(() => {
        dispatch(uiActions.ignoreSnapshotTime());
    }, [dispatch]);

    return {
        showSnapshotModeMessage,
        formattedDate,
        onShowLiveDashboard,
    };
};
