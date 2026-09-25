// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAttribute,
    type IInsight,
    type ISeparators,
    attributeDisplayFormRef,
    attributeLocalId,
    idRef,
    newAttribute,
    newAttributeSort,
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
        dualAxis?: unknown;
        primaryChartType?: unknown;
        secondaryChartType?: unknown;
        inlineVisualizations?: unknown;
    };
    attribute?: unknown;
    measures?: unknown[];
    primaryMeasures?: unknown[];
    secondaryMeasures?: unknown[];
    xAxisMeasure?: unknown;
    yAxisMeasure?: unknown;
    size?: unknown;
    primaryMeasure?: unknown;
    targetMeasure?: unknown;
    comparativeMeasure?: unknown;
    attributeFrom?: unknown;
    attributeTo?: unknown;
    viewBy?: unknown;
    stackBy?: unknown;
    trendBy?: unknown;
    segmentBy?: unknown;
    measure?: unknown;
    rows?: unknown;
    columns?: unknown;
    location?: unknown;
    color?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    area?: unknown;
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
    BubbleChart: recorder("BubbleChart"),
    BulletChart: recorder("BulletChart"),
    ColumnChart: recorder("ColumnChart"),
    ComboChart: recorder("ComboChart"),
    LineChart: recorder("LineChart"),
    PieChart: recorder("PieChart"),
    DonutChart: recorder("DonutChart"),
    PyramidChart: recorder("PyramidChart"),
    FunnelChart: recorder("FunnelChart"),
    RadarChart: recorder("RadarChart"),
    Repeater: recorder("Repeater"),
    SankeyChart: recorder("SankeyChart"),
    DependencyWheelChart: recorder("DependencyWheelChart"),
    ScatterPlot: recorder("ScatterPlot"),
    Treemap: recorder("Treemap"),
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

vi.mock("@gooddata/sdk-ui-geo", () => ({
    GeoPushpinChart: recorder("GeoPushpinChart"),
    GeoAreaChart: recorder("GeoAreaChart"),
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
    props: {
        isTable?: boolean;
        enableNewPivotTable?: boolean;
    } = {},
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
        ["local:bubble", "BubbleChart"],
        ["local:bullet", "BulletChart"],
        ["local:column", "ColumnChart"],
        ["local:combo2", "ComboChart"],
        ["local:line", "LineChart"],
        ["local:pie", "PieChart"],
        ["local:donut", "DonutChart"],
        ["local:pyramid", "PyramidChart"],
        ["local:funnel", "FunnelChart"],
        ["local:radar", "RadarChart"],
        ["local:repeater", "Repeater"],
        ["local:treemap", "Treemap"],
        ["local:sankey", "SankeyChart"],
        ["local:dependencywheel", "DependencyWheelChart"],
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
        ["local:area", "AreaChart"],
        ["local:bar", "BarChart"],
        ["local:bubble", "BubbleChart"],
        ["local:bullet", "BulletChart"],
        ["local:column", "ColumnChart"],
        ["local:combo2", "ComboChart"],
        ["local:line", "LineChart"],
        ["local:pie", "PieChart"],
        ["local:donut", "DonutChart"],
        ["local:pyramid", "PyramidChart"],
        ["local:funnel", "FunnelChart"],
        ["local:radar", "RadarChart"],
        ["local:repeater", "Repeater"],
        ["local:treemap", "Treemap"],
        ["local:sankey", "SankeyChart"],
        ["local:dependencywheel", "DependencyWheelChart"],
        ["local:scatter", "ScatterPlot"],
        ["local:headline", "Headline"],
        ["local:waterfall", "WaterfallChart"],
        ["local:heatmap", "Heatmap"],
    ])("applies default chart options to %s", (visualizationUrl, component) => {
        renderVisualisation(visualizationUrl);

        expect(lastProps.get(component)?.config).toMatchObject({
            enableChartSorting: true,
            enableReversedStacking: true,
            enableSeparateTotalLabels: true,
        });
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

    it("renders a stacked bar with only the first measure", () => {
        const viewAttribute = newAttribute("category");
        const stackAttribute = newAttribute("region");

        renderVisualisation(
            "local:bar",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1"), newMeasure("m2")),
                    newBucket("view", viewAttribute),
                    newBucket("stack", stackAttribute),
                ],
            },
        );

        expect(lastProps.get("BarChart")).toMatchObject({
            measures: [newMeasure("m1")],
            viewBy: viewAttribute,
            stackBy: stackAttribute,
        });
    });

    it("renders an unstacked bar with all measures", () => {
        const viewAttribute = newAttribute("category");

        renderVisualisation(
            "local:bar",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1"), newMeasure("m2")),
                    newBucket("view", viewAttribute),
                ],
            },
        );

        expect(lastProps.get("BarChart")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            viewBy: viewAttribute,
            stackBy: undefined,
        });
    });

    it("renders a stacked column with only the first measure", () => {
        const stackAttribute = newAttribute("region");

        renderVisualisation(
            "local:column",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1"), newMeasure("m2")),
                    newBucket("view", newAttribute("category")),
                    newBucket("stack", stackAttribute),
                ],
            },
        );

        expect(lastProps.get("ColumnChart")).toMatchObject({
            measures: [newMeasure("m1")],
            stackBy: stackAttribute,
        });
    });

    it("renders an unstacked column with all measures", () => {
        renderVisualisation(
            "local:column",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1"), newMeasure("m2")),
                    newBucket("view", newAttribute("category")),
                ],
            },
        );

        expect(lastProps.get("ColumnChart")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            stackBy: undefined,
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

    it("maps the treemap buckets and leaves its sorting to the chart", () => {
        const viewAttribute = newAttribute("category");
        const segmentAttribute = newAttribute("campaign");

        renderVisualisation(
            "local:treemap",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("view", viewAttribute),
                    newBucket("segment", segmentAttribute),
                ],
                sorts: [newAttributeSort(viewAttribute, "desc")],
            },
        );

        expect(lastProps.get("Treemap")).toMatchObject({
            measures: [newMeasure("m1")],
            viewBy: viewAttribute,
            segmentBy: segmentAttribute,
        });
        expect(lastProps.get("Treemap")).not.toHaveProperty("sortBy");
    });

    it("omits the treemap viewBy when the insight carries several measures", () => {
        renderVisualisation(
            "local:treemap",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1"), newMeasure("m2")),
                    newBucket("view", newAttribute("category")),
                ],
            },
        );

        expect(lastProps.get("Treemap")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            viewBy: undefined,
        });
    });

    it("renders a treemap of several measures with no attribute bucket", () => {
        renderVisualisation(
            "local:treemap",
            {},
            { buckets: [newBucket("measures", newMeasure("m1"), newMeasure("m2"))] },
        );

        expect(lastProps.get("Treemap")).toMatchObject({
            measures: [newMeasure("m1"), newMeasure("m2")],
            viewBy: undefined,
            segmentBy: undefined,
        });
    });

    it("spreads the bubble measure buckets across its axes and bubble size", () => {
        const viewAttribute = newAttribute("channel");

        renderVisualisation(
            "local:bubble",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("secondary_measures", newMeasure("m2")),
                    newBucket("tertiary_measures", newMeasure("m3")),
                    newBucket("view", viewAttribute),
                ],
            },
        );

        expect(lastProps.get("BubbleChart")).toMatchObject({
            xAxisMeasure: newMeasure("m1"),
            yAxisMeasure: newMeasure("m2"),
            size: newMeasure("m3"),
            viewBy: viewAttribute,
        });
    });

    it("renders a bubble whose insight only sizes the bubbles", () => {
        renderVisualisation(
            "local:bubble",
            {},
            { buckets: [newBucket("tertiary_measures", newMeasure("m3"))] },
        );

        expect(lastProps.get("BubbleChart")).toMatchObject({
            xAxisMeasure: undefined,
            yAxisMeasure: undefined,
            size: newMeasure("m3"),
        });
    });

    it("maps the bullet measure buckets to its primary, target and comparative measures", () => {
        const firstView = newAttribute("product");
        const secondView = newAttribute("region");

        renderVisualisation(
            "local:bullet",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("secondary_measures", newMeasure("m2")),
                    newBucket("tertiary_measures", newMeasure("m3")),
                    newBucket("view", firstView, secondView),
                ],
            },
        );

        expect(lastProps.get("BulletChart")).toMatchObject({
            primaryMeasure: newMeasure("m1"),
            targetMeasure: newMeasure("m2"),
            comparativeMeasure: newMeasure("m3"),
            viewBy: [firstView, secondView],
        });
    });

    it("splits the combo measures between its two axes", () => {
        const viewAttribute = newAttribute("category");

        renderVisualisation(
            "local:combo2",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("secondary_measures", newMeasure("m2")),
                    newBucket("view", viewAttribute),
                ],
            },
        );

        expect(lastProps.get("ComboChart")).toMatchObject({
            primaryMeasures: [newMeasure("m1")],
            secondaryMeasures: [newMeasure("m2")],
            viewBy: viewAttribute,
        });
    });

    it("leaves the combo axis types to the chart when the insight does not configure them", () => {
        renderVisualisation("local:combo2");

        expect(lastProps.get("ComboChart")?.config).toMatchObject({
            dualAxis: undefined,
            primaryChartType: undefined,
            secondaryChartType: undefined,
        });
    });

    it("carries over the combo axis types the insight configures", () => {
        renderVisualisation(
            "local:combo2",
            {},
            {
                properties: {
                    controls: {
                        dualAxis: false,
                        primaryChartType: "area",
                        secondaryChartType: "column",
                    },
                },
            },
        );

        expect(lastProps.get("ComboChart")?.config).toMatchObject({
            dualAxis: false,
            primaryChartType: "area",
            secondaryChartType: "column",
        });
    });

    it.each([
        ["local:sankey", "SankeyChart"],
        ["local:dependencywheel", "DependencyWheelChart"],
    ])("maps the %s endpoint buckets to attributeFrom and attributeTo", (url, component) => {
        const fromAttribute = newAttribute("campaign");
        const toAttribute = newAttribute("state");

        renderVisualisation(
            url,
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("attribute_from", fromAttribute),
                    newBucket("attribute_to", toAttribute),
                ],
            },
        );

        expect(lastProps.get(component)).toMatchObject({
            measure: newMeasure("m1"),
            attributeFrom: fromAttribute,
            attributeTo: toAttribute,
        });
    });

    it("renders a sankey whose insight carries only the target endpoint", () => {
        const toAttribute = newAttribute("state");

        renderVisualisation(
            "local:sankey",
            {},
            {
                buckets: [newBucket("measures", newMeasure("m1")), newBucket("attribute_to", toAttribute)],
            },
        );

        expect(lastProps.get("SankeyChart")).toMatchObject({
            measure: newMeasure("m1"),
            attributeFrom: undefined,
            attributeTo: toAttribute,
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

    it("keeps both the attributes and the measures of the repeater columns bucket", () => {
        const rowAttribute = newAttribute("campaign_name");
        const columnAttribute = newAttribute("campaign_name_cloned");
        const viewAttribute = newAttribute("type");

        renderVisualisation(
            "local:repeater",
            {},
            {
                buckets: [
                    newBucket("attribute", rowAttribute),
                    newBucket("columns", columnAttribute, newMeasure("m1")),
                    newBucket("view", viewAttribute),
                ],
            },
        );

        expect(lastProps.get("Repeater")).toMatchObject({
            attribute: rowAttribute,
            columns: [columnAttribute, newMeasure("m1")],
            viewBy: viewAttribute,
        });
    });

    it("passes the inline visualizations of the repeater to the chart", () => {
        const inlineVisualizations = { m1: { type: "line" } };

        renderVisualisation(
            "local:repeater",
            {},
            {
                buckets: [newBucket("attribute", newAttribute("campaign_name"))],
                properties: { inlineVisualizations },
            },
        );

        expect(lastProps.get("Repeater")?.config?.inlineVisualizations).toEqual(inlineVisualizations);
    });

    const pushpinInsight = {
        buckets: [
            newBucket(
                "location",
                newAttribute("customer_city_latitude", (a) => a.localId("loc")),
            ),
            newBucket("size", newMeasure("m1")),
            newBucket("color", newMeasure("m2")),
            newBucket("segment", newAttribute("order_id")),
        ],
        properties: {
            controls: { latitude: "customer_city_latitude", longitude: "customer_city_longitude" },
        },
    };

    it("rebuilds the pushpin latitude and longitude from the location bucket and the controls", () => {
        renderVisualisation("local:pushpin", {}, pushpinInsight);

        const latitude = lastProps.get("GeoPushpinChart")?.latitude as IAttribute;
        const longitude = lastProps.get("GeoPushpinChart")?.longitude as IAttribute;

        expect(attributeDisplayFormRef(latitude)).toEqual(idRef("customer_city_latitude", "displayForm"));
        expect(attributeLocalId(latitude)).toBe("loc");
        expect(attributeDisplayFormRef(longitude)).toEqual(idRef("customer_city_longitude", "displayForm"));
        expect(attributeLocalId(longitude)).toBe("longitude_df");
    });

    it("maps the remaining pushpin buckets to size, color and segment", () => {
        renderVisualisation("local:pushpin", {}, pushpinInsight);

        expect(lastProps.get("GeoPushpinChart")).toMatchObject({
            size: newMeasure("m1"),
            color: newMeasure("m2"),
            segmentBy: newAttribute("order_id"),
        });
    });

    it("renders a pushpin whose size bucket the insight leaves empty", () => {
        renderVisualisation(
            "local:pushpin",
            {},
            {
                ...pushpinInsight,
                buckets: pushpinInsight.buckets.filter((b) => b.localIdentifier !== "size"),
            },
        );

        expect(lastProps.get("GeoPushpinChart")).toMatchObject({
            size: undefined,
            color: newMeasure("m2"),
        });
    });

    it("renders no pushpin when the dataset carries only one of the two geo labels", () => {
        renderVisualisation(
            "local:pushpin",
            {},
            { ...pushpinInsight, properties: { controls: { latitude: "", longitude: "" } } },
        );

        expect(rendered).toEqual([]);
    });

    it("renders a choropleth from the area bucket", () => {
        renderVisualisation(
            "local:choropleth",
            {},
            {
                buckets: [
                    newBucket(
                        "area",
                        newAttribute("customer_country", (a) => a.localId("country")),
                    ),
                    newBucket("color", newMeasure("m1")),
                ],
            },
        );

        expect(rendered).toEqual([{ component: "GeoAreaChart", separators }]);
        expect(attributeLocalId(lastProps.get("GeoAreaChart")?.area as IAttribute)).toBe("country");
    });

    it("leaves the measures of the columns bucket out of the table columns", () => {
        const columnAttribute = newAttribute("region");

        renderVisualisation(
            "local:table",
            {},
            {
                buckets: [
                    newBucket("measures", newMeasure("m1")),
                    newBucket("columns", columnAttribute, newMeasure("m2")),
                ],
            },
        );

        expect(lastProps.get("PivotTableNext")).toMatchObject({
            measures: [newMeasure("m1")],
            columns: [columnAttribute],
        });
    });
});
