// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { navigateToStory } from "../_infra/testcafeUtils";

fixture("BarChart drilling");

const firstBar = Selector(
    ".s-visualization-chart .highcharts-series.highcharts-series-0 .highcharts-point",
).nth(0);

const lastEvent = Selector(".s-last-event");

const scenarios = [
    [
        "should work with measure identifier predicate",
        "50-stories-for-e2e-tests-drilling--bar-chart-with-identifier-measure-drilling",
    ],
    [
        "should work with measure localId predicate",
        "50-stories-for-e2e-tests-drilling--bar-chart-with-localid-measure-drilling",
    ],
    [
        "should work with attribute identifier predicate",
        "50-stories-for-e2e-tests-drilling--bar-chart-with-identifier-attribute-drilling",
    ],
    [
        "should work with attribute localId predicate",
        "50-stories-for-e2e-tests-drilling--bar-chart-with-localid-attribute-drilling",
    ],
];

scenarios.forEach(([name, path]) =>
    test(name, async (t) => {
        await navigateToStory(path)(t);

        await t.expect(lastEvent.innerText).eql("null");

        await t.expect(firstBar.exists).ok();
        await t.click(firstBar);

        await t.expect(lastEvent.innerText).match(/CompuSci/);
    }),
);
