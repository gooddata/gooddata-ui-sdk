// (C) 2021 GoodData Corporation

import { getBackend } from "./getBackend";
import {
    initializeDashboard,
    queryWidgetFilters,
    selectAnalyticalWidgetByRef,
    selectInsightByRef,
    HeadlessDashboard,
} from "@gooddata/sdk-ui-dashboard";
import { IFilter, insightSetFilters, ObjRef } from "@gooddata/sdk-model";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";
import { getExecution } from "./commonInsightExecution";

export async function getWidgetExecution(
    token: string,
    workspace: string,
    dashboardRef: ObjRef,
    widgetRef: ObjRef,
    filterContextRef: ObjRef,
) {
    const backend = getBackend(token);

    try {
        // eslint-disable-next-line no-console
        console.log(`HEADLES!`)

        const headlessDashboard = new HeadlessDashboard({
            backend,
            workspace,
            dashboardRef,
            filterContextRef
        })

        const initDashCommand = initializeDashboard(undefined, undefined, "corela")
        await headlessDashboard.dispatchAndWaitFor(initDashCommand, "GDC.DASH/EVT.INITIALIZED", 10000);

        const widget = headlessDashboard.select(selectAnalyticalWidgetByRef(widgetRef))
        if (!isInsightWidget(widget)) {
            throw "Widget is not an Insight widget or not found"
        }
        const insight = headlessDashboard.select(selectInsightByRef(widget.insight));

        const widgetFilters = await headlessDashboard.query(queryWidgetFilters(widgetRef));

        if (!insight) {
            throw "Widget insight not found";
        }
        const widgetInsight = insightSetFilters(insight, widgetFilters as IFilter[]);
        console.log("widgetInsight", widgetInsight);

        await getExecution(token, workspace, widgetInsight);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
    }
}
