// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import {
    ColumnChartWithArithmeticMeasuresAndViewBy,
    ColumnChartWithTwoMeasuresAndTwoViewBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base";

export default scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("Y axis on right", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdm.Amount), measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("dual axis with one right measure and three left", {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdmExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("dual axis when two viewBy attributes", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("X axis rotation", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            xaxis: {
                rotation: "45",
            },
        },
    })
    .addScenario("X axis invisible", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            xaxis: {
                visible: false,
            },
        },
    })
    .addScenario("Y axis on right with two viewBy attributes", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceLdm.Amount), measureLocalId(ReferenceLdm.Won)],
            },
        },
    });
