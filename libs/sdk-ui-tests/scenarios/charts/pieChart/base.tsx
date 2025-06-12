// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { PieChart, IPieChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const PieChartWithTwoMeasures = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
};

export const PieChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.Product.Name,
};

/*
 * TODO: used to have "tooltip for chart with small width and long names" ... same as with other charts,
 *  these width/height stories seemed like an after-thought and are not consistent across charts. need to
 *  revisit how to test these cases
 */

export default scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("two measures", PieChartWithTwoMeasures)
    .addScenario("single measure with viewBy", PieChartWithSingleMeasureAndViewBy)
    .addScenario("arithmetic measures", {
        measures: [
            ReferenceMd.Amount,
            ReferenceMd.Won,
            ReferenceMdExt.CalculatedLost,
            ReferenceMdExt.CalculatedWonLostRatio,
        ],
    });
