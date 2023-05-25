// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src/index.js";
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";
import {
    AreaChartViewByDate,
    AreaChartWithTwoMeasuresAndViewBy,
    AreaChartWithViewAndStackBy,
    AreaChartWithViewBy,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("two measures with viewBy and disabled stacking", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: { stacking: false },
    })
    .addScenario("two measures with viewBy and enabled stacking", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: { stacking: true },
    })
    .addScenario("two measures with viewBy and disabled stack measures", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: { stackMeasures: false },
    })
    .addScenario("two measures with viewBy and enabled stack measures", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: { stackMeasures: true },
    })
    .addScenario("two measures with viewBy and stack measures to percent", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: { stackMeasuresToPercent: true },
    })
    .addScenario("single measure with viewBy and stackBy and stack to percent", {
        ...AreaChartWithViewAndStackBy,
        config: { stackMeasuresToPercent: true },
    })
    .addScenario("single measure with viewBy and stackBy and stack to percent with labels", {
        ...AreaChartWithViewAndStackBy,
        config: { stackMeasuresToPercent: true, dataLabels: { visible: true } },
    })
    .addScenario("single measure with viewBy and stackBy and disabled stacking", {
        ...AreaChartWithViewAndStackBy,
        config: { stacking: false },
    })
    .addScenario("single measure with viewBy and stack to percent", {
        ...AreaChartWithViewBy,
        config: { stackMeasuresToPercent: true },
    })
    .addScenario("undefined values and disabled stacking", {
        ...AreaChartViewByDate,
        config: { stacking: false },
    })
    .addScenario("undefined values, disabled stacking and the continuous line enabled", {
        ...AreaChartViewByDate,
        config: { stacking: false, continuousLine: { enabled: true } },
    });
