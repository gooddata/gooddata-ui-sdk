// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui";
import {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithTwoMeasuresAndTwoViewBy,
    BarChartWithTwoMeasuresAndViewBy,
} from "./base";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("X axis min/max configuration", {
        ...BarChartWithTwoMeasuresAndViewBy,
        config: {
            xaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("X axis on top", {
        ...BarChartWithTwoMeasuresAndViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Amount), measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("dual axis with one top measure and three bottom", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdmExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("dual axis when two viewBy attributes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("Y axis rotation", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            yaxis: {
                rotation: "45",
            },
        },
    })
    .addScenario("Y axis invisible", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            yaxis: {
                visible: false,
            },
        },
    })
    .addScenario("X axis on top with two viewBy attributes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Amount), measureLocalId(ReferenceLdm.Won)],
            },
        },
    });
