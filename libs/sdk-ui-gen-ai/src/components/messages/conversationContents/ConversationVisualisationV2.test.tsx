// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IInsight, type ISeparators, idRef, newBucket, newMeasure } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { type IChatConversationLocalItem } from "../../../model.js";

import {
    ConversationVisualisation,
    type ConversationVisualisationProps,
} from "./ConversationVisualisationV2.js";

type RecordedProps = {
    insight?: IInsight["insight"];
    locale?: string;
    settings?: unknown;
    colorPalette?: unknown;
    theme?: unknown;
    config?: {
        separators?: ISeparators;
        enableChartSorting?: boolean;
        enableReversedStacking?: boolean;
        enableSeparateTotalLabels?: boolean;
        enableAccessibleTooltip?: boolean;
        cooperativeGestures?: boolean;
        tooltip?: unknown;
        legend?: unknown;
        agGridToken?: string;
        forecast?: unknown;
        anomalies?: unknown;
        clustering?: unknown;
    };
    filters?: unknown;
    drillableItems?: unknown;
    onDrill?: unknown;
    onError?: unknown;
    onExportReady?: unknown;
    execConfig?: unknown;
};

const rendered: { component: string; props: RecordedProps }[] = [];
const scopedThemes: unknown[] = [];

function recorder(component: string) {
    return function Recorder(props: RecordedProps) {
        rendered.push({ component, props });
        return null;
    };
}

vi.mock("@gooddata/sdk-ui-ext", () => ({
    InsightRenderer: recorder("InsightRenderer"),
    convertInsightToTableDefinition: (insight: IInsight) => ({
        insight: { ...insight.insight, visualizationUrl: "local:table" },
    }),
}));

vi.mock("@gooddata/sdk-ui-pivot/next", () => ({ useAgGridToken: (token?: string) => token }));

vi.mock("@gooddata/sdk-ui-theme-provider", () => ({
    ScopedThemeProvider: ({ children, theme }: { children: ReactNode; theme: unknown }) => {
        scopedThemes.push(theme);
        return children;
    },
    useTheme: () => ({ palette: { complementary: { c8: "#123456" } } }),
}));

const separators: ISeparators = { decimal: ",", thousand: " " };
const settings = {
    userId: "user-1",
    locale: "en-US",
    workspace: "workspace-1",
    separators,
    enableNewPivotTable: true,
    customSetting: true,
} as IUserWorkspaceSettings;
const colorPalette = [{ guid: "1", fill: { r: 18, g: 52, b: 86 } }];
const execConfig = { dataSamplingPercentage: 50 };

const message: IChatConversationLocalItem = {
    id: "message-1",
    localId: "message-1",
    responseId: "response-1",
    role: "assistant",
    type: "item",
    createdAt: 0,
    content: { type: "multipart", parts: [] },
};

function visualizationOf(visualizationUrl: string): IInsight {
    return {
        insight: {
            identifier: "vis-1",
            uri: "/vis-1",
            ref: idRef("vis-1"),
            title: "Total Revenue",
            visualizationUrl,
            buckets: [newBucket("measures", newMeasure("m1"))],
            filters: [],
            sorts: [],
            properties: {},
        },
    };
}

function renderVisualisation(
    visualizationUrl: string,
    props: Partial<ConversationVisualisationProps> = {},
    insight: Partial<IInsight["insight"]> = {},
) {
    const base = visualizationOf(visualizationUrl);

    return render(
        <Provider store={configureStore({ reducer: () => ({}) })}>
            <IntlWrapper>
                <ConversationVisualisation
                    message={message}
                    visualization={{ insight: { ...base.insight, ...insight } }}
                    separators={separators}
                    {...props}
                />
            </IntlWrapper>
        </Provider>,
    );
}

describe("ConversationVisualisation", () => {
    beforeEach(() => {
        rendered.length = 0;
        scopedThemes.length = 0;
    });

    it("renders a chart insight through InsightRenderer", () => {
        const insight = visualizationOf("local:bar").insight;

        renderVisualisation("local:bar", {
            settings,
            colorPalette: [...colorPalette],
            execConfig,
            enableAccessibleChartTooltip: true,
        });

        expect(rendered).toHaveLength(1);
        expect(rendered[0].component).toBe("InsightRenderer");
        expect(rendered[0].props).toMatchObject({
            insight: { insight },
            settings,
            colorPalette,
            execConfig,
            locale: "en-US",
            config: {
                separators,
                enableChartSorting: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
                enableAccessibleTooltip: true,
                cooperativeGestures: true,
                tooltip: { className: "gd-gen-ai-chat__vis_tooltip" },
                legend: { responsive: "autoPositionWithPopup" },
            },
        });
        expect(rendered[0].props).not.toHaveProperty("filters");
        expect(rendered[0].props.onDrill).toEqual(expect.any(Function));
        expect(rendered[0].props.onError).toEqual(expect.any(Function));
        expect(rendered[0].props.onExportReady).toEqual(expect.any(Function));
    });

    it("maps forecast and anomaly detection controls for line insights", () => {
        renderVisualisation(
            "local:line",
            {},
            {
                properties: {
                    controls: {
                        forecast: { period: 5, confidence: 0.8, seasonal: true },
                        anomalyDetection: { sensitivity: "high", color: "#123456", size: "medium" },
                    },
                },
            },
        );

        expect(rendered[0].props.config).toMatchObject({
            forecast: { enabled: true, period: 5, confidence: 0.8, seasonal: true },
            anomalies: {
                enabled: true,
                sensitivity: "high",
                color: { type: "rgb", value: { r: 18, g: 52, b: 86 } },
                size: "medium",
            },
        });
    });

    it("maps clustering controls only for scatter insights", () => {
        const controls = { clustering: { numberOfClusters: 5, threshold: 0.1 } };

        renderVisualisation("local:scatter", {}, { properties: { controls } });
        renderVisualisation("local:bar", {}, { properties: { controls } });

        expect(rendered[0].props.config).toMatchObject({
            clustering: { enabled: true, numberOfClusters: 5, threshold: 0.1 },
        });
        expect(rendered[1].props.config).not.toHaveProperty("clustering");
    });

    it("uses the custom KPI theme for generic rendering", () => {
        renderVisualisation("local:headline");

        expect(scopedThemes).toHaveLength(1);
        expect(scopedThemes[0]).toMatchObject({
            kpi: {
                primaryMeasureColor: "#123456",
                secondaryInfoColor: "#123456",
            },
        });
        expect(rendered[0].props).not.toHaveProperty("theme");
    });

    it("renders the table toggle as a converted insight", () => {
        renderVisualisation("local:bar", { isTable: true, settings, agGridToken: "token" });

        expect(rendered).toHaveLength(1);
        expect(rendered[0]).toMatchObject({
            component: "InsightRenderer",
            props: {
                insight: {
                    insight: {
                        visualizationUrl: "local:table",
                    },
                },
                settings,
                config: { agGridToken: "token", separators },
            },
        });
    });
});
