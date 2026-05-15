// (C) 2021-2026 GoodData Corporation

import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { WebComponentScenarioHarness } from "./WebComponentScenarioHarness";

type DashboardHost = HTMLElement & {
    dashboard?: string;
    pluginMode?: "disabled";
    extraPlugins?: Array<{ factory: () => object }>;
};

export function DashboardPluginWarningScenario() {
    return (
        <WebComponentScenarioHarness
            element="gd-dashboard-embed"
            hostClassName="s-wc-dashboard-host"
            onHostReady={(host) => {
                const dashboardHost = host as DashboardHost;

                dashboardHost.dashboard = Dashboards.KPIs;
                dashboardHost.pluginMode = "disabled";
                dashboardHost.extraPlugins = [{ factory: () => ({}) }];
            }}
        />
    );
}
