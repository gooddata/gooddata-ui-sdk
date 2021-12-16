// (C) 2021 GoodData Corporation

import { getBackend } from "./getBackend";

export async function getWidgetExecution(
    token: string,
    projectId: string,
    widgetUri: string,
    dashboardUri: string,
    filterContextUri: string,
) {
    const backend = getBackend(token);
    console.log(backend, projectId, widgetUri, dashboardUri, filterContextUri);
}
