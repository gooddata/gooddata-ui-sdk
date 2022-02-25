// (C) 2021-2022 GoodData Corporation
import { DashboardEvents, ICustomDashboardEvent, IDashboardEventHandling } from "@gooddata/sdk-ui-dashboard";

type DashboardPluginTestEvent = CustomEvent<DashboardEvents>;

const DASHBOARD_PLUGIN_TEST_EVENT = "dashboardPluginsTestEvent";

function dispatchDashboardPluginEventToTests(
    doc: Document,
    event: DashboardEvents | ICustomDashboardEvent<any>,
) {
    doc.dispatchEvent(new CustomEvent(DASHBOARD_PLUGIN_TEST_EVENT, { detail: event }));
}

export function listenForDashboardPluginEvents(
    doc: Document,
    callback: (event: DashboardEvents | ICustomDashboardEvent<any>) => void,
) {
    function doCallback(event: Event) {
        callback((event as DashboardPluginTestEvent).detail);
    }

    doc.addEventListener(DASHBOARD_PLUGIN_TEST_EVENT, doCallback);

    return function unsubscribe() {
        doc.removeEventListener(DASHBOARD_PLUGIN_TEST_EVENT, doCallback);
    };
}

export function withDashboardPluginTestEventHandling(handlers: any) {
    (handlers as IDashboardEventHandling).addEventHandler("*", (evt) => {
        dispatchDashboardPluginEventToTests(document, evt);
    });
}
