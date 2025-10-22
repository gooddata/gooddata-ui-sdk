// (C) 2023-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { DependencyWheelChart, IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
export const DependencyWheelChartWithMeasureAttributeFromAndTo = {
    measure: ReferenceMd.Amount,
    attributeFrom: ReferenceMd.Product.Name,
    attributeTo: ReferenceMd.Region.Default,
};
export const DependencyWheelChartWithMeasureAndAttributeFrom = {
    measure: ReferenceMd.Amount,
    attributeFrom: ReferenceMd.Product.Name,
};
export const DependencyWheelChartWithMeasureAttributeTo = {
    measure: ReferenceMd.Amount,
    attributeTo: ReferenceMd.Region.Default,
};
export default scenariosFor<IDependencyWheelChartProps>("DependencyWheelChart", DependencyWheelChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        screenshotSize: { width: 800, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("measure only", {
        measure: ReferenceMd.Amount,
    })
    .addScenario("measure and attributeFrom", DependencyWheelChartWithMeasureAndAttributeFrom)
    .addScenario("measure and attributeTo", DependencyWheelChartWithMeasureAttributeTo)
    .addScenario("measure, attributeFrom and attributeTo", DependencyWheelChartWithMeasureAttributeFromAndTo);
