// (C) 2007-2018 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { checkRenderChart, loginUserAndNavigate } from "./utils/helpers";
import { HIGHCHART_VERSION } from "./utils/constants";

fixture("Visualization by identifier")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/insightView/insightView-by-identifier`));

test("Chart visualization should render", async (t) => {
    const chart = Selector(".s-insightView-chart svg"); // could need timeout ie 20 secs to work
    await t
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent)
        .eql(
            `Created with Highcharts ${HIGHCHART_VERSION}Month/Year (Date)$ Total Sales$2,707,184$2,625,617$2,579,553Jan 2016Feb 2016Mar 201601M2M3M`,
        );
});

test("Pivot table visualization should render", async (t) => {
    const table = Selector(".s-insightView-pivot");
    const tableHeader = Selector(
        ".s-insightView-pivot .s-table-measure-column-header-group-cell-0 .s-header-cell-label",
    );

    await t.expect(table.exists).eql(true);
    await t.expect(tableHeader.exists).eql(true);
    await t.expect(tableHeader.textContent).eql("Month/Year (Date)");
});

test("Bar chart should render", async (t) => {
    await checkRenderChart(".s-insightView-bar", t);
});

test("Line chart should render", async (t) => {
    await checkRenderChart(".s-insightView-line", t);
});

test("Area chart should render", async (t) => {
    await checkRenderChart(".s-insightView-area", t);
});

test("Headline chart should render", async (t) => {
    await checkRenderChart(".s-insightView-headline", t);
});

test("Scatter plot should render", async (t) => {
    await checkRenderChart(".s-insightView-scatter", t);
});

test("Bubble chart should render", async (t) => {
    await checkRenderChart(".s-insightView-bubble", t);
});

test("Pie chart should render", async (t) => {
    await checkRenderChart(".s-insightView-pie", t);
});

test("Donut chart should render", async (t) => {
    await checkRenderChart(".s-insightView-donut", t);
});

test("Treemap should render", async (t) => {
    await checkRenderChart(".s-insightView-treemap", t);
});

test("Heatmap should render", async (t) => {
    await checkRenderChart(".s-insightView-heatmap", t);
});
