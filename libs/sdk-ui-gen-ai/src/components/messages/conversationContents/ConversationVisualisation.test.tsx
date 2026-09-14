// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IInsight,
    type ISeparators,
    idRef,
    newAttribute,
    newBucket,
    newMeasure,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { type IChatConversationLocalItem } from "../../../model.js";

import { ConversationVisualisation } from "./ConversationVisualisation.js";

type RecordedProps = {
    config?: {
        separators?: ISeparators;
        total?: unknown;
        legend?: unknown;
        stackMeasures?: unknown;
        stackMeasuresToPercent?: unknown;
    };
    measures?: unknown[];
    viewBy?: unknown;
    stackBy?: unknown;
    trendBy?: unknown;
    segmentBy?: unknown;
    measure?: unknown;
    rows?: unknown;
    columns?: unknown;
};

const rendered: { component: string; separators: ISeparators | undefined }[] = [];
const lastProps = new Map<string, RecordedProps>();

function recorder(component: string) {
    return function Recorder(props: RecordedProps) {
        rendered.push({ component, separators: props.config?.separators });
        lastProps.set(component, props);
        return null;
    };
}

vi.mock("@gooddata/sdk-ui-charts", () => ({
    AreaChart: recorder("AreaChart"),
    BarChart: recorder("BarChart"),
    ColumnChart: recorder("ColumnChart"),
    LineChart: recorder("LineChart"),
    PieChart: recorder("PieChart"),
    DonutChart: recorder("DonutChart"),
    PyramidChart: recorder("PyramidChart"),
    FunnelChart: recorder("FunnelChart"),
    RadarChart: recorder("RadarChart"),
    ScatterPlot: recorder("ScatterPlot"),
    Headline: recorder("Headline"),
    Heatmap: recorder("Heatmap"),
    WaterfallChart: recorder("WaterfallChart"),
}));

vi.mock("@gooddata/sdk-ui-pivot", () => ({
    PivotTable: recorder("PivotTable"),
}));

vi.mock("@gooddata/sdk-ui-pivot/next", () => ({
    PivotTableNext: recorder("PivotTableNext"),
    useAgGridToken: (token?: string) => token,
}));

vi.mock("@gooddata/sdk-ui-dashboard", () => ({
    getKdaKeyDriverCombinations: () => [],
}));

vi.mock("@gooddata/sdk-ui-theme-provider", () => ({
    ScopedThemeProvider: ({ children }: { children?: ReactNode }) => children,
    useTheme: () => undefined,
}));

const separators: ISeparators = { thousand: ".", decimal: "," };

const message: IChatConversationLocalItem = {
    id: "1",
    localId: "1",
    responseId: "1",
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
    props: { isTable?: boolean; enableNewPivotTable?: boolean } = {},
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
        lastProps.clear();
    });

    it.each([
        ["local:area", "AreaChart"],
        ["local:bar", "BarChart"],
        ["local:column", "ColumnChart"],
        ["local:line", "LineChart"],
        ["local:pie", "PieChart"],
        ["local:donut", "DonutChart"],
        ["local:pyramid", "PyramidChart"],
        ["local:funnel", "FunnelChart"],
        ["local:radar", "RadarChart"],
        ["local:scatter", "ScatterPlot"],
        ["local:headline", "Headline"],
        ["local:waterfall", "WaterfallChart"],
        ["local:heatmap", "Heatmap"],
        ["local:table", "PivotTableNext"],
    ])("passes the workspace separators to %s", (visualizationUrl, component) => {
        renderVisualisation(visualizationUrl);

        expect(rendered).toEqual([{ component, separators }]);
    });

    it("passes the workspace separators to the table shown by the chart-to-table toggle", () => {
        renderVisualisation("local:bar", { isTable: true });

        expect(rendered).toEqual([{ component: "PivotTableNext", separators }]);
    });

    it("passes the workspace separators to the legacy pivot table", () => {
        renderVisualisation("local:table", { enableNewPivotTable: false });

        expect(rendered).toEqual([{ component: "PivotTable", separators }]);
    });

    it.each([
        ["local:pie", "PieChart"],
        ["local:donut", "DonutChart"],
        ["local:pyramid", "PyramidChart"],
        ["local:funnel", "FunnelChart"],
    ])("lets the legend of %s collapse into a popup in the narrow chat panel", (url, component) => {
        renderVisualisation(url);

        expect(lastProps.get(component)?.config?.legend).toEqual({
            responsive: "autoPositionWithPopup",
        });
    });

    it("leaves the area stacking to the chart when the insight does not configure it", () => {
        renderVisualisation("local:area");

        expect(lastProps.get("AreaChart")?.config).toMatchObject({
            stackMeasures: undefined,
            stackMeasuresToPercent: undefined,
        });
    });

    it("carries over the area stacking the insight configures", () => {
        renderVisualisation(
            "local:area",
            {},
            { properties: { controls: { stackMeasures: true, stackMeasuresToPercent: true } } },
        );

        expect(lastProps.get("AreaChart")?.config).toMatchObject({
            stackMeasures: true,
            stackMeasuresToPercent: true,
        });
    });

    it("maps the radar trend bucket to trendBy and the segment bucket to segmentBy", () => {
        const trendAttribute = newAttribute("category");
        const segmentAttribute = newAttribute("campaign");

        renderVisualisation(
            "local:radar",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("trend", trendAttribute),
                    newBucket("segment", segmentAttribute),
                ],
            },
        );

        expect(lastProps.get("RadarChart")).toMatchObject({
            measures: [newMeasure("m1")],
            trendBy: trendAttribute,
            segmentBy: segmentAttribute,
        });
    });

    it("renders a radar of several measures with neither trend nor segment", () => {
        renderVisualisation(
            "local:radar",
            {},
            { buckets: [newBucket("measures", newMeasure("m1"), newMeasure("m2"))] },
        );

        expect(lastProps.get("RadarChart")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            trendBy: undefined,
            segmentBy: undefined,
        });
    });

    it("renders a waterfall broken down by an attribute and carries over its total config", () => {
        const viewAttribute = newAttribute("category");

        renderVisualisation(
            "local:waterfall",
            {},
            {
                buckets: [newBucket("measures", newMeasure("m1")), newBucket("view", viewAttribute)],
                properties: { controls: { total: { name: "Total" } } },
            },
        );

        expect(lastProps.get("WaterfallChart")).toMatchObject({
            measures: [newMeasure("m1")],
            viewBy: viewAttribute,
            config: { total: { name: "Total" } },
        });
    });

    it("maps the heatmap view bucket to rows and the stack bucket to columns", () => {
        const rowAttribute = newAttribute("type");
        const columnAttribute = newAttribute("campaign");

        renderVisualisation(
            "local:heatmap",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("view", rowAttribute),
                    newBucket("stack", columnAttribute),
                ],
            },
        );

        expect(lastProps.get("Heatmap")).toMatchObject({
            measure: newMeasure("m1"),
            rows: rowAttribute,
            columns: columnAttribute,
        });
    });

    it("renders a waterfall of several measures with no viewBy", () => {
        renderVisualisation(
            "local:waterfall",
            {},
            { buckets: [newBucket("measures", newMeasure("m1"), newMeasure("m2"))] },
        );

        expect(lastProps.get("WaterfallChart")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            viewBy: undefined,
        });
    });
});
