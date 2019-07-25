// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

async function checkRenderChart(selector, t) {
    const loading = Selector(".s-loading");
    const chart = Selector(selector);

    await t.expect(loading.exists).ok();

    await t
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent)
        .ok();
}

fixture("Basic components") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}`));

test("Column chart should render", async t => {
    await checkRenderChart(".s-column-chart", t);
});

test("Bar chart should render", async t => {
    await checkRenderChart(".s-bar-chart", t);
});

test("Line chart should render", async t => {
    await checkRenderChart(".s-line-chart", t);
});

test("Line chart should have custom colors", async t => {
    const lineChart = Selector(".s-line-chart");
    const CUSTOM_COLORS = [
        "rgb(195, 49, 73)",
        "rgb(168, 194, 86)",
        "rgb(243, 217, 177)",
        "rgb(194, 153, 121)",
    ];

    await t.expect(lineChart.exists).ok();
    const legendIcons = lineChart.find(".series-icon");

    /* eslint-disable no-await-in-loop */
    for (let index = 0; index < CUSTOM_COLORS.length; index += 1) {
        await t
            .expect(await legendIcons.nth(index).getStyleProperty("background-color"))
            .eql(CUSTOM_COLORS[index]);
    }
    /* eslint-enable no-await-in-loop */
});

test("Pie chart should render", async t => {
    await checkRenderChart(".s-pie-chart", t);
});

test("Table should render", async t => {
    await checkRenderChart(".s-table", t);
});

test("KPI has correct number", async t => {
    const kpi = Selector(".gdc-kpi", { timeout: 20000 });
    await t
        .expect(kpi.exists)
        .ok()
        .expect(kpi.textContent)
        .eql("$92,556,577");
});

test("Donut chart should render", async t => {
    await checkRenderChart(".s-donut-chart", t);
});

test("Scatter plot should render", async t => {
    await checkRenderChart(".s-scatter-plot", t);
});

test("Bubble chart should render", async t => {
    await checkRenderChart(".s-bubble-chart", t);
});

test("Treemap should render", async t => {
    await checkRenderChart(".s-tree-map", t);
});

test("Headline should render", async t => {
    await checkRenderChart(".s-headline", t);
});

test("Heatmap should render", async t => {
    await checkRenderChart(".s-heat-map", t);
});
