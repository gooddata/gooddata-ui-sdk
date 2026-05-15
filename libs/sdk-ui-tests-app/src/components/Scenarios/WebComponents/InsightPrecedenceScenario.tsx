// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { Insights } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { createBackend } from "../../../backend";
import { workspace } from "../../../constants";

import { WebComponentScenarioHarness } from "./WebComponentScenarioHarness";

type InsightHost = HTMLElement & {
    context?: {
        backend: ReturnType<typeof createBackend>;
        workspaceId: string;
    };
    insight?: string;
    title?: string | boolean;
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

export function InsightPrecedenceScenario() {
    const [renderedState, setRenderedState] = useState("");
    const [titleText, setTitleText] = useState("");

    return (
        <WebComponentScenarioHarness
            element="gd-insight-embed"
            hostClassName="s-wc-insight-host"
            hostAttributes={{
                insight: "missing-insight-bootstrap",
                title: "Bootstrap Title",
            }}
            onHostReady={(host) => {
                const insightHost = host as InsightHost;

                insightHost.context = {
                    backend: createBackend(),
                    workspaceId: workspace,
                };
                insightHost.insight = Insights.Headline;
                insightHost.title = "Property Title";

                return bindInsightState(insightHost, setRenderedState, setTitleText);
            }}
        >
            <div className="s-wc-rendered-state">{renderedState}</div>
            <div className="s-wc-title-text">{titleText}</div>
        </WebComponentScenarioHarness>
    );
}
