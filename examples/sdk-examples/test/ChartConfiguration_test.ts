// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Chart configuration")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/chart-configuration`));

const tooltipCssSelector = ".gd-viz-tooltip-item .gd-viz-tooltip-value";

test("should be able to change configuration of bucket component chart and render them", async (t) => {
    const changePaletteBtn = Selector(".s-bar-chart .s-change-palette");
    const changeLegendBtn = Selector(".s-bar-chart .s-change-legend");
    const changeSeparatorBtn = Selector(".s-bar-chart .s-change-separator");
    const legend = Selector(".s-bar-chart .viz-legend");
    const barChart = Selector(".s-bar-chart");
    const tooltip = Selector(tooltipCssSelector);

    await t
        .expect(barChart.visible)
        .ok()
        .expect(legend.visible)
        .ok()
        .expect(legend.hasClass("position-top"))
        .ok()
        .click(Selector(".highcharts-series-1 rect").nth(0))
        .wait(500)
        .expect(tooltip.nth(1).textContent)
        .eql("1,179,436");

    await t
        .expect(changeLegendBtn.visible)
        .ok()
        .click(changeLegendBtn)
        .expect(barChart.visible)
        .ok()
        .expect(legend.hasClass("position-right"))
        .ok()
        .click(changeLegendBtn)
        .expect(legend.exists)
        .notOk();

    await t
        .expect(changeSeparatorBtn.visible)
        .ok()
        .click(changeSeparatorBtn)
        .expect(barChart.visible)
        .ok()
        .click(barChart.find(".highcharts-series-1 rect").nth(0))
        .wait(500)
        .expect(tooltip.nth(1).textContent)
        .eql("1.179.436");

    await t
        .expect(changePaletteBtn.visible)
        .ok()
        .click(changePaletteBtn)
        .expect(barChart.visible)
        .ok()
        .expect(barChart.find(".highcharts-series-1 rect").nth(0).getAttribute("fill"))
        .eql("rgb(168,194,86)");
});

test("should be able to change configuration of visualization chart and render them", async (t) => {
    const changePaletteBtn = Selector(".s-insightView-column .s-change-palette");
    const changeLegendBtn = Selector(".s-insightView-column .s-change-legend");
    const changeSeparatorBtn = Selector(".s-insightView-column .s-change-separator");
    const legend = Selector(".s-insightView-column .viz-legend");
    const columnChart = Selector(".s-insightView-column");
    const tooltip = Selector(tooltipCssSelector);

    await t
        .hover(columnChart)
        .expect(columnChart.visible)
        .ok()
        .expect(legend.visible)
        .ok()
        .expect(legend.hasClass("position-top"))
        .ok()
        .click(columnChart.find(".highcharts-series-1 rect").nth(0))
        .wait(500)
        .expect(tooltip.nth(1).textContent)
        .eql("$1,179,436");

    await t
        .expect(changeLegendBtn.visible)
        .ok()
        .click(changeLegendBtn)
        .expect(columnChart.visible)
        .ok()
        .expect(legend.hasClass("position-right"))
        .ok()
        .click(changeLegendBtn)
        .expect(legend.exists)
        .notOk();

    await t
        .expect(changeSeparatorBtn.visible)
        .ok()
        .click(changeSeparatorBtn)
        .expect(columnChart.visible)
        .ok()
        .click(columnChart.find(".highcharts-series-1 rect").nth(0))
        .wait(500)
        .expect(tooltip.nth(1).textContent)
        .eql("$1.179.436");

    await t
        .expect(changePaletteBtn.visible)
        .ok()
        .click(changePaletteBtn)
        .expect(columnChart.visible)
        .ok()
        .expect(columnChart.find(".highcharts-series-1 rect").nth(0).getAttribute("fill"))
        .eql("rgb(168,194,86)");
});

test("should be able to change configuration of dual axis chart and render them", async (t) => {
    const dualAxisBarChart = Selector(".s-insightView-dual-axis-bar");
    const dualAxisColumnChart = Selector(".s-dual-axis-column-chart");
    const primaryYAxisLabels = ".highcharts-axis-labels.s-highcharts-primary-yaxis text";
    const secondaryYAxisLabels = ".highcharts-axis-labels.s-highcharts-secondary-yaxis text";

    await t
        .hover(dualAxisColumnChart)
        .expect(dualAxisColumnChart.visible)
        .ok()
        .expect(dualAxisColumnChart.find(primaryYAxisLabels).nth(1).textContent)
        .eql("-50M", "To set min scale value incorrectly")
        .expect(dualAxisColumnChart.find(primaryYAxisLabels).nth(3).textContent)
        .eql("100M", "To set max scale value incorrectly")
        .expect(dualAxisColumnChart.find(secondaryYAxisLabels).nth(1).textContent)
        .eql("-50M", "To set min scale value incorrectly")
        .expect(dualAxisColumnChart.find(secondaryYAxisLabels).nth(3).textContent)
        .eql("100M", "To set max scale value incorrectly");

    await t
        .hover(dualAxisBarChart)
        .expect(dualAxisBarChart.visible)
        .ok()
        .expect(dualAxisBarChart.find(primaryYAxisLabels).nth(3).textContent)
        .eql("-45M", "To set min scale value incorrectly")
        .expect(dualAxisBarChart.find(primaryYAxisLabels).nth(11).textContent)
        .eql("75M", "To set max scale value incorrectly")
        .expect(dualAxisBarChart.find(secondaryYAxisLabels).nth(3).textContent)
        .eql("-45M", "To set min scale value incorrectly")
        .expect(dualAxisBarChart.find(secondaryYAxisLabels).nth(11).textContent)
        .eql("75M", "To set max scale value incorrectly");
});
