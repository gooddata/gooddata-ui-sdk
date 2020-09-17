// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { checkRenderChart, loginUserAndNavigate } from "./utils/helpers";

fixture("Basic components").beforeEach(loginUserAndNavigate(config.url));

test("Column chart should render", async (t) => {
    await checkRenderChart(".s-column-chart", t);
});

test("Bar chart should render", async (t) => {
    await checkRenderChart(".s-bar-chart", t);
});

test("Line chart should render", async (t) => {
    await checkRenderChart(".s-line-chart", t);
});

test("Line chart should have custom colors", async (t) => {
    const lineChart = Selector(".s-line-chart");
    const CUSTOM_COLORS = [
        "rgb(195, 49, 73)",
        "rgb(168, 194, 86)",
        "rgb(243, 217, 177)",
        "rgb(194, 153, 121)",
    ];

    await t.expect(lineChart.exists).ok();
    const legendIcons = lineChart.find(".series-icon");

    for (let index = 0; index < CUSTOM_COLORS.length; index += 1) {
        await t
            .expect(await legendIcons.nth(index).getStyleProperty("background-color"))
            .eql(CUSTOM_COLORS[index]);
    }
});

test("Area chart should render", async (t) => {
    await checkRenderChart(".s-area-chart", t);
});

test("Stacked area chart should render", async (t) => {
    await checkRenderChart(".s-stacked-area-chart", t);
});

test("Pie chart should render", async (t) => {
    await checkRenderChart(".s-pie-chart", t);
});

test("Donut chart should render", async (t) => {
    await checkRenderChart(".s-donut-chart", t);
});

test("Combo chart should render", async (t) => {
    await checkRenderChart(".s-combo-chart", t);
});

test("Scatter plot should render", async (t) => {
    await checkRenderChart(".s-scatter-plot", t);
});

test("Bubble chart should render", async (t) => {
    await checkRenderChart(".s-bubble-chart", t);
});

test("Bullet chart should render", async (t) => {
    await checkRenderChart(".s-bullet-chart", t);
});

test("Treemap should render", async (t) => {
    await checkRenderChart(".s-tree-map", t);
});

test("Heatmap should render", async (t) => {
    await checkRenderChart(".s-heat-map", t);
});

test("Headline should render", async (t) => {
    await checkRenderChart(".s-headline", t);
});

test("KPI should render", async (t) => {
    const kpi = Selector(".gdc-kpi", { timeout: 20000 });
    await t
        .expect(kpi.exists)
        .ok()
        .expect(kpi.textContent)
        .match(/\$[0-9,]+/);
});
