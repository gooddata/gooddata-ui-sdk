// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const BarChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
    stackBy: ReferenceLdm.Region,
};

export const BarChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
};

export const BarChartWithTwoMeasuresAndTwoViewByFiltered = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    filters: [
        newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["WonderKid"]),
        newPositiveAttributeFilter(ReferenceLdm.Region, ["East Coast"]),
    ],
};

export const BarChartWithSingleMeasureAndViewByAndStackMultipleItems = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Region],
    stackBy: ReferenceLdm.Product.Name,
};

export const BarChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    stackBy: ReferenceLdm.Department,
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
    measures: [ReferenceLdm.Amount],
    stackBy: ReferenceLdm.Account.Name,
    filters: [newPositiveAttributeFilter(ReferenceLdm.Account.Name, { uris: arrayOfAccountUris })],
};

export const BarChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartViewByDateAndPop = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.WonPopClosedYear],
    viewBy: [ReferenceLdm.ClosedYear],
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
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
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newMeasureSort(ReferenceLdm.Won, "asc")],
    })
    .addScenario("viewBy date and PoP measure", BarChartViewByDateAndPop)
    .addScenario("arithmetic measures", BarChartWithArithmeticMeasuresAndViewBy)
    .addScenario("four measures and PoP", {
        measures: [
            ReferenceLdm.Amount,
            ReferenceLdm.Won,
            ReferenceLdmExt.WonPopClosedYear,
            ReferenceLdmExt.CalculatedLost,
            ReferenceLdmExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceLdm.ClosedYear],
    });
