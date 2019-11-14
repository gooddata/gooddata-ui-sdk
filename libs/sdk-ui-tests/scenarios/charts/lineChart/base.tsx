// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with trendBy", {
        measures: [ReferenceLdm.Amount],
        trendBy: ReferenceLdm.CreatedQuarterYear,
    })
    .addScenario("two measures with trendBy", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        trendBy: ReferenceLdm.CreatedQuarterYear,
    })
    .addScenario("single measure with trendBy and segmentBy", {
        measures: [ReferenceLdm.Amount],
        trendBy: ReferenceLdm.CreatedQuarterYear,
        segmentBy: ReferenceLdm.Region,
    });
