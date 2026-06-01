// (C) 2025-2026 GoodData Corporation

import { type INotification, isAlertNotification } from "@gooddata/sdk-model";

export function getDashboardUrl(notification: INotification, useAsOfDateParam = false) {
    if (!isAlertNotification(notification)) {
        return null;
    }

    const dashboardURL = notification.details.data.automation.dashboardURL;
    const isCustomDashboardURL = notification.details.data.automation.isCustomDashboardURL;

    if (isCustomDashboardURL || !notification.automationId) {
        return dashboardURL;
    }

    const url = new URL(dashboardURL);

    // Add parameters function
    const addParams = (params: URLSearchParams) => {
        if (!params.has("automationId")) {
            params.append("automationId", notification.automationId!);
        }
        if (useAsOfDateParam && !params.has("asOfDate")) {
            params.append("asOfDate", notification.details.timestamp);
        }
        return params;
    };

    // If URL has a hash, add parameters to the hash part
    if (url.hash) {
        const baseUrl = `${url.origin}${url.pathname}${url.search}`;
        const hashPath = url.hash.substring(1);

        // Split hash into route and params if it contains a query string
        const [hashRoute, paramString] = hashPath.includes("?") ? hashPath.split("?", 2) : [hashPath, ""];

        // Add parameters to hash part
        const hashParams = addParams(new URLSearchParams(paramString));

        return `${baseUrl}#${hashRoute}?${hashParams.toString()}`;
    }

    // For URLs without hash, add parameters to the URL search
    url.search = addParams(new URLSearchParams(url.search)).toString();
    return url.toString();
}
