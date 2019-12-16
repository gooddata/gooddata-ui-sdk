// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm, checkRenderChart, checkDrill } from "./utils/helpers";
import {
    barOnDrillExtendedParams,
    headlineOnDrillExtendedParams,
    visualizationOnDrillExtendedParams,
} from "./OnDrillHandlingFixtures.js";

const haywardBarSelector = Selector(".highcharts-series.highcharts-series-0 .highcharts-point").nth(4);
const headlineValueSelector = Selector(".s-headline-primary-item .s-headline-value");

const firstColumnSelector = Selector(
    ".s-visualization-chart .highcharts-series.highcharts-series-0 .highcharts-point",
).nth(0);

fixture("New drill handling by onDrill") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/hidden/on-drill-drilling`));

test("OnDrill on Bar chart should work", async t => {
    await checkRenderChart(".s-bar-chart", t);
    await t.click(haywardBarSelector);
    await checkDrill(t, barOnDrillExtendedParams, ".s-bar-chart-on-drill .s-output");
});

test("OnDrill on Headline should work", async t => {
    await checkRenderChart(".s-headline", t);
    await t.click(headlineValueSelector);
    await checkDrill(t, headlineOnDrillExtendedParams, ".s-headline-on-drill .s-output");
});

test("OnDrill on Visualization should work", async t => {
    await checkRenderChart(".s-visualization-chart", t);
    await t.click(firstColumnSelector);
    await checkDrill(t, visualizationOnDrillExtendedParams, ".s-visualization-on-drill .s-output");
});
