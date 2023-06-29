// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import {
    ComboChartWithArithmeticMeasuresAndViewBy,
    ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    ComboChartWithTwoSecondaryMeasures,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

/*
 * TODO: there was "stack primary measures with same chart type and custom width style" story
 *  that was changing width of div in which combo renders; why only done for combo and not
 *  for all other charts? this needs to be addressed in a more holistic fashion
 */

const stackMeasuresDiffCharts = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "stack primary measures with different chart type" })
    .addScenario("stack primary measures with different chart type - column", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "column",
            stackMeasures: true,
        },
    })
    .addScenario("stack primary measures with different chart type - area", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "area",
            stackMeasures: true,
        },
    });

const stackMeasuresToPercentDiffCharts = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "stack primary measures to 100% with different chart type" })
    .addScenario("stack primary measures to 100% with different chart type - column", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "column",
            stackMeasuresToPercent: true,
        },
    })
    .addScenario("stack primary measures to 100% with different chart type - area", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "area",
            stackMeasuresToPercent: true,
        },
    });

const stackMeasuresBothChartsColumn = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "stack primary measures when both column chart" })
    .addScenario("stack primary measures when both column chart - normal stacking", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "column",
            secondaryChartType: "column",
            stackMeasures: true,
        },
    })
    .addScenario("stack primary measures when both column chart - stack to 100%", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            primaryChartType: "column",
            secondaryChartType: "column",
            stackMeasures: true,
            stackMeasuresToPercent: true,
        },
    });

const discardStacking = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "discard stacking when primary measures are on line chart" })
    .addScenario("discard stacking when primary measures are on line chart - secondary is column", {
        ...ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
        config: {
            primaryChartType: "line",
            secondaryChartType: "column",
            stackMeasures: true,
        },
    })
    .addScenario("discard stacking when primary measures are on line chart - secondary is area", {
        ...ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
        config: {
            primaryChartType: "line",
            secondaryChartType: "area",
            stackMeasures: true,
        },
    });

const discardStackingWhenNoPrimary = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "discard stacking when primary measures are not specified" })
    .addScenario("discard stacking when primary measures are not specified - secondary is column", {
        ...ComboChartWithTwoSecondaryMeasures,
        config: {
            primaryChartType: "line",
            secondaryChartType: "column",
            stackMeasures: true,
        },
    })
    .addScenario("discard stacking when primary measures are not specified - secondary is area", {
        ...ComboChartWithTwoSecondaryMeasures,
        config: {
            primaryChartType: "line",
            secondaryChartType: "area",
            stackMeasures: true,
        },
    });

const stackingWithoutDualAxis = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.Stacking)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "stacking without dual axis" })
    .addScenario("'Stack Measures' off and 'Stack to 100%' on", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            dualAxis: false,
            stackMeasures: false,
            stackMeasuresToPercent: true,
        },
    })
    .addScenario("'Stack Measures' on and 'Stack to 100%' on", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            dualAxis: false,
            stackMeasures: true,
            stackMeasuresToPercent: true,
        },
    });

export default [
    stackMeasuresDiffCharts,
    stackMeasuresToPercentDiffCharts,
    stackMeasuresBothChartsColumn,
    discardStacking,
    discardStackingWhenNoPrimary,
    stackingWithoutDualAxis,
];
