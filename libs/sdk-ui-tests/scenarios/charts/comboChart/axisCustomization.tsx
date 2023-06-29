// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src/index.js";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import {
    ComboChartWithArithmeticMeasuresAndViewBy,
    ComboChartWithMultipleMeasuresAndNoViewBy,
    ComboChartWithTwoMeasuresAndNoViewBy,
    ComboChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { comboVariants } from "./_variants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const twoMeasures = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis two measures with slicing" })
    .addScenarios("dual axis two measures with slicing", ComboChartWithTwoMeasuresAndViewBy, comboVariants);

const twoMeasuresNoSlicing = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis two measures without slicing" })
    .addScenarios(
        "dual axis two measures without slicing",
        ComboChartWithTwoMeasuresAndNoViewBy,
        comboVariants,
    );

const multipleMeasures = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis multiple measures with slicing" })
    .addScenarios(
        "dual axis multiple measures with slicing",
        ComboChartWithArithmeticMeasuresAndViewBy,
        comboVariants,
    );

const multipleMeasuresNoSlicing = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis multiple measures without slicing" })
    .addScenarios(
        "dual axis multiple measures without slicing",
        ComboChartWithMultipleMeasuresAndNoViewBy,
        comboVariants,
    );

const axisNameConfig = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "axis name configuration" })
    .addScenarios("axis name configuration", ComboChartWithTwoMeasuresAndViewBy, axisNameCustomization);

const others = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("dual axis disabled", {
        ...ComboChartWithTwoMeasuresAndViewBy,
        config: {
            dualAxis: false,
        },
    });

export default [
    twoMeasures,
    twoMeasuresNoSlicing,
    multipleMeasures,
    multipleMeasuresNoSlicing,
    axisNameConfig,
    others,
];
