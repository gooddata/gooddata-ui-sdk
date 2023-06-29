// (C) 2023 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { SankeyChart, ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
export const SankeyChartWithMeasureAttributeFromAndTo = {
    measure: ReferenceMd.Amount,
    attributeFrom: ReferenceMd.Product.Name,
    attributeTo: ReferenceMd.Region,
};
export const SankeyChartWithMeasureAndAttributeFrom = {
    measure: ReferenceMd.Amount,
    attributeFrom: ReferenceMd.Product.Name,
};
export const SankeyChartWithMeasureAttributeTo = {
    measure: ReferenceMd.Amount,
    attributeTo: ReferenceMd.Region,
};
export default scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 800 } })
    .addScenario("measure only", {
        measure: ReferenceMd.Amount,
    })
    .addScenario("measure and attributeFrom", SankeyChartWithMeasureAndAttributeFrom)
    .addScenario("measure and attributeTo", SankeyChartWithMeasureAttributeTo)
    .addScenario("measure, attributeFrom and attributeTo", SankeyChartWithMeasureAttributeFromAndTo);
