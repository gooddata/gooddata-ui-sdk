// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { WebComponentScenarioHarness } from "./WebComponentScenarioHarness";

type DashboardHost = HTMLElement;
type DashboardScenarioHost = DashboardHost & {
    pluginMode?: "disabled";
};
type GdErrorDetail = {
    phase?: string;
    message?: string;
};

function bindDiagnostics(
    host: DashboardHost,
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

export function DashboardLifecycleScenario() {
    const [primaryResult, setPrimaryResult] = useState("");
    const [lastErrorPhase, setLastErrorPhase] = useState("");
    const [lastErrorMessage, setLastErrorMessage] = useState("");

    return (
        <WebComponentScenarioHarness
            element="gd-dashboard-embed"
            hostClassName="s-wc-dashboard-host"
            hostAttributes={{
                dashboard: Dashboards.KPIs,
            }}
            onHostReady={(host) => {
                (host as DashboardScenarioHost).pluginMode = "disabled";

                return bindDiagnostics(host, setPrimaryResult, setLastErrorPhase, setLastErrorMessage);
            }}
        >
            <div className="s-wc-last-error-phase">{lastErrorPhase}</div>
            <div className="s-wc-last-error-message">{lastErrorMessage}</div>
            <div className="s-wc-result-primary" data-scenario-result-primary="">
                {primaryResult}
            </div>
        </WebComponentScenarioHarness>
    );
}
