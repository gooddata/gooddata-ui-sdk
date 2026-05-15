// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { WebComponentScenarioHarness } from "./WebComponentScenarioHarness";

type DashboardHost = HTMLElement & {
    dashboard?: string;
    pluginMode?: "disabled";
    refresh: () => Promise<void>;
    replaceFilters: (filters: unknown[]) => Promise<void>;
};
type GdErrorDetail = {
    phase?: string;
    message?: string;
};

function bindDiagnostics(
    host: HTMLElement,
    setPrimaryResult: (value: string) => void,
    setLastErrorPhase: (value: string) => void,
    setLastErrorMessage: (value: string) => void,
) {
    const readPrimaryResult = () => {
        const primaryResult =
            host.querySelector(".s-dash-item-0_0 .s-headline-primary-item .s-headline-value")?.textContent ??
            host.querySelector(".s-dash-item-0_0 .s-headline-value")?.textContent ??
            "";

        setPrimaryResult(primaryResult.trim());
    };

    readPrimaryResult();

    const observer = new MutationObserver(() => {
        readPrimaryResult();
    });

    observer.observe(host, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    const handleError = (event: Event) => {
        const detail = (event as CustomEvent<GdErrorDetail>).detail;

        setLastErrorPhase(detail?.phase ?? "");
        setLastErrorMessage(detail?.message ?? "");
    };

    host.addEventListener("gd-error", handleError);

    return () => {
        observer.disconnect();
        host.removeEventListener("gd-error", handleError);
    };
}

export function DashboardCommandsScenario() {
    const [primaryResult, setPrimaryResult] = useState("");
    const [refreshStatus, setRefreshStatus] = useState("idle");
    const [replaceFiltersStatus, setReplaceFiltersStatus] = useState("idle");
    const [lastErrorPhase, setLastErrorPhase] = useState("");
    const [lastErrorMessage, setLastErrorMessage] = useState("");

    return (
        <WebComponentScenarioHarness
            element="gd-dashboard-embed"
            hostClassName="s-wc-dashboard-host"
            onHostReady={(host) => {
                const dashboardHost = host as DashboardHost;

                dashboardHost.pluginMode = "disabled";
                dashboardHost.dashboard = Dashboards.KPIs;

                const cleanupDiagnostics = bindDiagnostics(
                    dashboardHost,
                    setPrimaryResult,
                    setLastErrorPhase,
                    setLastErrorMessage,
                );
                const originalRefresh = dashboardHost.refresh.bind(dashboardHost);
                const originalReplaceFilters = dashboardHost.replaceFilters.bind(dashboardHost);

                dashboardHost.refresh = async () => {
                    setRefreshStatus("pending");

                    try {
                        await originalRefresh();
                        setRefreshStatus("resolved");
                    } catch (error) {
                        setRefreshStatus("rejected");
                        throw error;
                    }
                };

                dashboardHost.replaceFilters = async (filters) => {
                    setReplaceFiltersStatus("pending");

                    try {
                        await originalReplaceFilters(filters);
                        setReplaceFiltersStatus("resolved");
                    } catch (error) {
                        setReplaceFiltersStatus("rejected");
                        throw error;
                    }
                };

                return () => {
                    cleanupDiagnostics();
                    dashboardHost.refresh = originalRefresh;
                    dashboardHost.replaceFilters = originalReplaceFilters;
                };
            }}
        >
            <div className="s-wc-command-refresh-status" data-scenario-refresh-status="">
                {refreshStatus}
            </div>
            <div className="s-wc-command-replace-filters-status" data-scenario-replace-filters-status="">
                {replaceFiltersStatus}
            </div>
            <div className="s-wc-last-error-phase">{lastErrorPhase}</div>
            <div className="s-wc-last-error-message">{lastErrorMessage}</div>
            <div className="s-wc-result-primary" data-scenario-result-primary="">
                {primaryResult}
            </div>
        </WebComponentScenarioHarness>
    );
}
