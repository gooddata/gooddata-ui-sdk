// (C) 2021-2022 GoodData Corporation
import { DashboardEvents, ICustomDashboardEvent, IDashboardEventHandling } from "@gooddata/sdk-ui-dashboard";

type DashboardPluginTestEvent = CustomEvent<DashboardEvents>;

const DASHBOARD_PLUGIN_TEST_EVENT = "dashboardPluginsTestEvent";

function dispatchDashboardPluginEventToTests(
    window: Window,
    event: DashboardEvents | ICustomDashboardEvent<any>,
) {
    window.dispatchEvent(new CustomEvent(DASHBOARD_PLUGIN_TEST_EVENT, { detail: event }));
}

/**
 * @internal
 */
export function listenForDashboardPluginEvents(
    window: Window,
    callback: (event: DashboardEvents | ICustomDashboardEvent<any>) => void,
) {
    function doCallback(event: Event) {
        callback((event as DashboardPluginTestEvent).detail);
    }

    window.addEventListener(DASHBOARD_PLUGIN_TEST_EVENT, doCallback);

    return function unsubscribe() {
        window.removeEventListener(DASHBOARD_PLUGIN_TEST_EVENT, doCallback);
    };
}

/**
 * @internal
 */
export function withDashboardPluginTestEventHandling(handlers: any) {
    (handlers as IDashboardEventHandling).addEventHandler("*", (evt) => {
        dispatchDashboardPluginEventToTests(window, evt);
    });
}
