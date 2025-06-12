// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithSingleMeasureAndViewBy,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "./base.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("two measures and two viewBy with stackMeasures", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            stackMeasures: true,
        },
    })
    .addScenario("two measures and two viewBy with stackMeasuresToPercent", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            stackMeasuresToPercent: true,
        },
    })
    .addScenario("two measures and two viewBy with top axis and stackMeasuresToPercent", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            stackMeasuresToPercent: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("two measures with dual axis ignores stack measures", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            stackMeasures: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Amount)],
            },
        },
    })
    .addScenario("two measures with dual axis and stack measures to 100%", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            stackMeasuresToPercent: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Amount)],
            },
        },
    })
    .addScenario("stack measures and dual axis", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            stackMeasures: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("stack measures to 100% and dual axis", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            stackMeasuresToPercent: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("stack measures to 100% with dual axis and axis min/max", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            stackMeasuresToPercent: true,
            xaxis: {
                min: "0.1",
                max: "0.9",
            },
            secondary_xaxis: {
                min: "1",
                max: "2",
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("single measure ignores stack measures", {
        ...BarChartWithSingleMeasureAndViewBy,
        config: {
            stackMeasures: true,
        },
    })
    // note: this scenario was described as 'ignores stack to 100%' in old storybooks,
    //  but that was actually not happening, screenshots recorded opposite behavior :)
    .addScenario("single measure with stack to 100%", {
        ...BarChartWithSingleMeasureAndViewBy,
        config: {
            stackMeasuresToPercent: true,
        },
    });
