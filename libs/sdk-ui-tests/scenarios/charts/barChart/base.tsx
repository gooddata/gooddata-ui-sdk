// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const BarChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
    stackBy: ReferenceMd.Region,
};

export const BarChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region],
};

export const BarChartWithTwoMeasuresAndTwoViewByFiltered = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region],
    filters: [
        newPositiveAttributeFilter(ReferenceMd.Product.Name, ["WonderKid"]),
        newPositiveAttributeFilter(ReferenceMd.Region, ["East Coast"]),
    ],
};

export const BarChartWithSingleMeasureAndViewByAndStackMultipleItems = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Region],
    stackBy: ReferenceMd.Product.Name,
};

export const BarChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region],
    stackBy: ReferenceMd.Department,
};

const arrayOfAccountUris = [
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1426",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1427",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2872",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2873",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1428",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2874",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2871",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2875",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1429",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2876",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1430",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1432",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1431",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1433",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1434",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1435",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2877",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2878",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1436",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1437",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2879",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2880",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1438",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2881",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1439",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1440",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=9",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2882",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1441",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=10",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=4513",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=4514",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2888",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=13",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=4672",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=14",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=2889",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=16",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1446",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=15",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1447",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=4515",
    "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1057/elements?id=1448",
];

export const BarChartWithLargeLegend = {
    measures: [ReferenceMd.Amount],
    stackBy: ReferenceMd.Account.Name,
    filters: [newPositiveAttributeFilter(ReferenceMd.Account.Name, { uris: arrayOfAccountUris })],
};

export const BarChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartViewByDateAndPop = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.Year.Default],
};

export const BarChartViewByTwoDates = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.Year.Default, ReferenceMdExt.ModifiedClosedYear],
};

export const BarChartStackByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    stackBy: ReferenceMd.DateDatasets.Closed.Year.Default,
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", BarChartWithSingleMeasureAndViewBy)
    .addScenario("single measure with viewBy and stackBy", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("single measure with two viewBy and stack", BarChartWithSingleMeasureAndTwoViewByAndStack)
    .addScenario("two measures with viewBy", BarChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with two viewBy", BarChartWithTwoMeasuresAndTwoViewBy)
    .addScenario(
        "two measures with two viewBy, filtered to single value",
        BarChartWithTwoMeasuresAndTwoViewByFiltered,
    )
    .addScenario("two measures with viewBy sorted by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("viewBy date and PoP measure", BarChartViewByDateAndPop)
    .addScenario("arithmetic measures", BarChartWithArithmeticMeasuresAndViewBy)
    .addScenario("four measures and PoP", {
        measures: [
            ReferenceMd.Amount,
            ReferenceMd.Won,
            ReferenceMdExt.WonPopClosedYear,
            ReferenceMdExt.CalculatedLost,
            ReferenceMdExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceMd.DateDatasets.Closed.Year.Default],
    })
    .addScenario("viewBy with two dates", BarChartViewByTwoDates)
    .addScenario("stackBy with one date", BarChartStackByDate);
