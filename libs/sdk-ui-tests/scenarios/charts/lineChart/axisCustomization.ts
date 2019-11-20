// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui";
import { LineChartTwoMeasuresWithTrendyBy, LineChartWithArithmeticMeasuresAndViewBy } from "./base";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("Y axis on the right", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdm.Amount), measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("dual axes with one right measure", {
        ...LineChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdmExt.CalculatedWonLostRatio)],
            },
        },
    });
