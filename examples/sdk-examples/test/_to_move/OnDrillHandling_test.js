// // (C) 2007-2020 GoodData Corporation
// import { Selector } from "testcafe";
// import { config } from "./utils/config";
// import { loginUserAndNavigate, checkRenderChart, checkDrill } from "./utils/helpers";
// import {
//     barOnDrillExtendedParams,
//     headlineOnDrillExtendedParams,
//     visualizationOnDrillExtendedParams,
//     bulletPrimaryMeasureOnDrillExtendedParams,
//     bulletComparativeMeasureOnDrillExtendedParams,
//     bulletTargetMeasureOnDrillExtendedParams,
// } from "./OnDrillHandlingFixtures.js";

// const haywardBarSelector = Selector(".highcharts-series.highcharts-series-0 .highcharts-point").nth(4);
// const headlineValueSelector = Selector(".s-headline-primary-item .s-headline-value");

// const firstColumnSelector = Selector(
//     ".s-visualization-chart .highcharts-series.highcharts-series-0 .highcharts-point",
// ).nth(0);

// const bulletPrimaryMeasureSelector = Selector(
//     ".s-bullet-chart .highcharts-series.highcharts-series-0 .highcharts-point",
// ).nth(2);
// const bulletComparativeMeasureSelector = Selector(
//     ".s-bullet-chart .highcharts-series.highcharts-series-2 .highcharts-point",
// ).nth(2);
// const bulletTargetMeasureSelector = Selector(
//     ".s-bullet-chart .highcharts-series.highcharts-series-1 .highcharts-bullet-target",
// ).nth(2);

// fixture("New drill handling by onDrill").beforeEach(
//     loginUserAndNavigate(`${config.url}/hidden/on-drill-drilling`),
// );

// test("OnDrill on Bar chart should work", async t => {
//     await checkRenderChart(".s-bar-chart", t);
//     await t.click(haywardBarSelector);
//     await checkDrill(t, barOnDrillExtendedParams, ".s-bar-chart-on-drill .s-output");
// });

// test("OnDrill on Headline should work", async t => {
//     await checkRenderChart(".s-headline", t);
//     await t.click(headlineValueSelector);
//     await checkDrill(t, headlineOnDrillExtendedParams, ".s-headline-on-drill .s-output");
// });

// test("OnDrill on Visualization should work", async t => {
//     await checkRenderChart(".s-visualization-chart", t);
//     await t.click(firstColumnSelector);
//     await checkDrill(t, visualizationOnDrillExtendedParams, ".s-visualization-on-drill .s-output");
// });

// test("OnDrill on Bullet chart should work", async t => {
//     await checkRenderChart(".s-bullet-chart", t);
//     await t.click(bulletPrimaryMeasureSelector);
//     await checkDrill(t, bulletPrimaryMeasureOnDrillExtendedParams, ".s-bullet-chart-on-drill .s-output");
//     await t.click(bulletTargetMeasureSelector);
//     await checkDrill(t, bulletTargetMeasureOnDrillExtendedParams, ".s-bullet-chart-on-drill .s-output");
//     await t.click(bulletComparativeMeasureSelector, { offsetY: 1 });
//     await checkDrill(t, bulletComparativeMeasureOnDrillExtendedParams, ".s-bullet-chart-on-drill .s-output");
// });
