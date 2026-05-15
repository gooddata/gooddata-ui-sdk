// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { Insights } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { WebComponentScenarioHarness } from "./WebComponentScenarioHarness";

type InsightHost = HTMLElement & {
    refresh: () => Promise<void>;
};

function bindInsightState(
    host: HTMLElement,
    setRenderedState: (value: string) => void,
    setTitleText: (value: string) => void,
) {
    const readState = () => {
        const renderedState = host.querySelector(
            ".s-headline-value, .highcharts-container, [data-testid='pivot-table-next']",
        )
            ? "rendered"
            : "";
        const title =
            host.querySelector(".gd-vis-header .gd-vis-header-text, .insight-title")?.textContent?.trim() ??
            "";

        setRenderedState(renderedState);
        setTitleText(title);
    };

    readState();

    const observer = new MutationObserver(() => {
        readState();
    });

    observer.observe(host, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    return () => {
        observer.disconnect();
    };
}

export function InsightRefreshScenario() {
    const [renderedState, setRenderedState] = useState("");
    const [titleText, setTitleText] = useState("");
    const [refreshStatus, setRefreshStatus] = useState("idle");

    return (
        <WebComponentScenarioHarness
            element="gd-insight-embed"
            hostClassName="s-wc-insight-host"
            hostAttributes={{
                insight: Insights.Headline,
                title: "Refresh Title",
            }}
            onHostReady={(host) => {
                const insightHost = host as InsightHost;
                const cleanupInsightState = bindInsightState(insightHost, setRenderedState, setTitleText);
                const originalRefresh = insightHost.refresh.bind(insightHost);

                insightHost.refresh = async () => {
                    setRefreshStatus("pending");

                    try {
                        await originalRefresh();
                        setRefreshStatus("resolved");
                    } catch (error) {
                        setRefreshStatus("rejected");
                        throw error;
                    }
                };

                return () => {
                    cleanupInsightState();
                    insightHost.refresh = originalRefresh;
                };
            }}
        >
            <div className="s-wc-rendered-state">{renderedState}</div>
            <div className="s-wc-title-text">{titleText}</div>
            <div className="s-wc-command-refresh-status">{refreshStatus}</div>
        </WebComponentScenarioHarness>
    );
}
