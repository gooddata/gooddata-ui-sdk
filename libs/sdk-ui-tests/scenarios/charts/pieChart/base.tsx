// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { PieChart, IPieChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const PieChartWithTwoMeasures = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
};

export const PieChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: ReferenceLdm.Product.Name,
};

/*
 * TODO: used to have "tooltip for chart with small width and long names" ... same as with other charts,
 *  these width/height stories seemed like an after-thought and are not consistent across charts. need to
 *  revisit how to test these cases
 */

export default scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("two measures", PieChartWithTwoMeasures)
    .addScenario("single measure with viewBy", PieChartWithSingleMeasureAndViewBy)
    .addScenario("arithmetic measures", {
        measures: [
            ReferenceLdm.Amount,
            ReferenceLdm.Won,
            ReferenceLdmExt.CalculatedLost,
            ReferenceLdmExt.CalculatedWonLostRatio,
        ],
    });
